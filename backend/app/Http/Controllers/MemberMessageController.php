<?php

namespace App\Http\Controllers;

use App\Models\Member;
use App\Models\MemberInboxMessage;
use App\Models\MemberMessage;
use App\Models\MemberOutboxMessage;
use Illuminate\Http\Request;

class MemberMessageController extends Controller
{
    public function compose(Request $request)
    {
        $validated = $request->validate([
            'send_to' => 'required|string|max:255',
            'subject' => 'required|string|max:255',
            'message_details' => 'required|string',
            'sender_user_id' => 'nullable|string|max:255',
        ]);

        $senderUserId = trim((string) ($request->header('X-Auth-Member') ?: ($validated['sender_user_id'] ?? '')));

        if ($senderUserId === '') {
            return response()->json([
                'message' => 'Missing sender member identifier.',
            ], 422);
        }

        $sender = Member::where('user_id', $senderUserId)->first();

        if (!$sender) {
            return response()->json([
                'message' => 'Sender member not found.',
            ], 404);
        }

        $receiverUserId = trim((string) $validated['send_to']);
        $receiver = Member::where('user_id', $receiverUserId)->first();

        $message = MemberMessage::create([
            'sender_member_id' => $sender->id,
            'sender_user_id' => $sender->user_id,
            'receiver_member_id' => $receiver?->id,
            'receiver_user_id' => $receiverUserId,
            'subject' => trim((string) $validated['subject']),
            'message_details' => trim((string) $validated['message_details']),
        ]);

        MemberInboxMessage::create([
            'member_message_id' => $message->id,
            'receiver_member_id' => $receiver?->id,
            'receiver_user_id' => $receiverUserId,
            'sender_user_id' => $sender->user_id,
            'subject' => $message->subject,
            'message_details' => $message->message_details,
            'is_read' => false,
        ]);

        MemberOutboxMessage::create([
            'member_message_id' => $message->id,
            'sender_member_id' => $sender->id,
            'sender_user_id' => $sender->user_id,
            'receiver_user_id' => $receiverUserId,
            'subject' => $message->subject,
            'message_details' => $message->message_details,
            'is_read' => false,
        ]);

        return response()->json([
            'message' => 'Message sent successfully.',
            'data' => [
                'id' => $message->id,
                'send_to' => $message->receiver_user_id,
                'subject' => $message->subject,
                'message_details' => $message->message_details,
                'created_at' => optional($message->created_at)?->toDateTimeString(),
            ],
        ], 201);
    }

    public function inbox(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string|max:255',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $memberUserId = trim((string) ($request->header('X-Auth-Member') ?: ($validated['user_id'] ?? '')));

        if ($memberUserId === '') {
            return response()->json([
                'message' => 'Missing member identifier.',
                'data' => [],
            ], 422);
        }

        $limit = (int) ($validated['limit'] ?? 200);

        $rows = MemberInboxMessage::query()
            ->where('receiver_user_id', $memberUserId)
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(function (MemberInboxMessage $message) {
                return [
                    'id' => $message->id,
                    'from' => $message->sender_user_id,
                    'to' => $message->receiver_user_id,
                    'subject' => $message->subject,
                    'message_details' => $message->message_details,
                    'status' => $message->is_read ? 'Read' : 'Unread',
                    'created_at' => optional($message->created_at)?->toDateTimeString(),
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Inbox fetched successfully.',
            'data' => $rows,
        ]);
    }

    public function outbox(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'nullable|string|max:255',
            'limit' => 'nullable|integer|min:1|max:500',
        ]);

        $memberUserId = trim((string) ($request->header('X-Auth-Member') ?: ($validated['user_id'] ?? '')));

        if ($memberUserId === '') {
            return response()->json([
                'message' => 'Missing member identifier.',
                'data' => [],
            ], 422);
        }

        $limit = (int) ($validated['limit'] ?? 200);

        $rows = MemberOutboxMessage::query()
            ->where('sender_user_id', $memberUserId)
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(function (MemberOutboxMessage $message) {
                return [
                    'id' => $message->id,
                    'from' => $message->sender_user_id,
                    'to' => $message->receiver_user_id,
                    'subject' => $message->subject,
                    'message_details' => $message->message_details,
                    'status' => $message->is_read ? 'Read' : 'Unread',
                    'created_at' => optional($message->created_at)?->toDateTimeString(),
                ];
            })
            ->values();

        return response()->json([
            'message' => 'Outbox fetched successfully.',
            'data' => $rows,
        ]);
    }
}
