<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;

class Member extends Authenticatable
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'sponsor_id',
        'parent_id',
        'position',
        'fullname',
        'dob',
        'gender',
        'pan_number',
        'mobile_no',
        'email',
        'password',
        'address',
        'pin_code',
        'state',
        'city',
        'district',
        'shipping_address',
        'shipping_state',
        'shipping_city',
        'shipping_district',
        'shipping_pin_code',
        'nominee_name',
        'nominee_relation',
        'nominee_mobile_no',
        'nominee_address',
        'nominee_state',
        'nominee_city',
        'nominee_district',
        'nominee_pin_code',
        'status',
        'activation_date',
    ];

    protected $hidden = [
        'password',
    ];

    /**
     * Generate a reasonably unique MLM user_id when creating.
     */
    public static function booted()
    {
        static::creating(function ($member) {
            if (empty($member->user_id)) {
                $member->user_id = self::generateUserId();
            }
        });
    }

    public static function generateUserId()
    {
        do {
            $candidate = '4STEP' . strtoupper(substr(md5(uniqid((string)mt_rand(), true)), 0, 6));
        } while (self::where('user_id', $candidate)->exists());

        return $candidate;
    }
}
