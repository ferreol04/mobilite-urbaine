<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('alertes', function (Blueprint $table) {
            $table->string('custom_type')->nullable()->after('type_incident_id');
            $table->foreignId('type_incident_id')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('alertes', function (Blueprint $table) {
            $table->dropColumn('custom_type');
            $table->foreignId('type_incident_id')->nullable(false)->change();
        });
    }
};
