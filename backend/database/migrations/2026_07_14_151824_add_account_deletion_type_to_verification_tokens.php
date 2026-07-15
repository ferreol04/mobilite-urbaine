<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE verification_tokens MODIFY COLUMN type ENUM('account_verification', 'magic_login', 'account_deletion')");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE verification_tokens MODIFY COLUMN type ENUM('account_verification', 'magic_login')");
    }
};
