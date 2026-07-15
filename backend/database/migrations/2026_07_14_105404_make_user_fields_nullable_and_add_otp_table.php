<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_name')->nullable()->change();
            $table->string('first_name')->nullable()->change();
            $table->string('password')->nullable()->change();
            $table->boolean('has_password')->default(true)->after('password');
            $table->timestamp('password_suggested_at')->nullable()->after('has_password');
        });

        Schema::create('verification_tokens', function (Blueprint $table) {
            $table->id();
            $table->string('email');
            $table->string('token', 64)->unique();
            $table->enum('type', ['account_verification', 'magic_login', 'account_deletion']);
            $table->json('pending_contribution')->nullable();
            $table->timestamp('expires_at');
            $table->boolean('used')->default(false);
            $table->timestamps();

            $table->index(['email', 'type']);
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('last_name')->nullable(false)->change();
            $table->string('first_name')->nullable(false)->change();
            $table->string('password')->nullable(false)->change();
            $table->dropColumn(['has_password', 'password_suggested_at']);
        });

        Schema::dropIfExists('verification_tokens');
    }
};
