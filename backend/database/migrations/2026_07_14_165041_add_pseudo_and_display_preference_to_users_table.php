<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('pseudo')->unique()->nullable()->after('first_name');
            $table->enum('display_name_preference', ['pseudo', 'real_name'])->default('real_name')->after('pseudo');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['pseudo', 'display_name_preference']);
        });
    }
};
