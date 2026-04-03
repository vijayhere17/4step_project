<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MyKyc extends Model
{
    use HasFactory;

    protected $table = 'my_kyc';

    protected $fillable = [
        'member_id',
        'user_id',
        'account_beneficiary_name',
        'account_no',
        'ifs_code',
        'bank_name',
        'branch_name',
        'aadhar_number',
        'pan_number',
        'otp_verified',
        'transaction_password_hash',
        'transaction_password_status',
        'transaction_password_checked_at',
    ];
}
