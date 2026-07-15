<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('zones_a_risque', function (Blueprint $table) {
            $table->dropColumn('critical_period');
            $table->json('periods_distribution')->nullable()->after('incident_count');
        });
    }

    public function down(): void
    {
        Schema::table('zones_a_risque', function (Blueprint $table) {
            $table->dropColumn('periods_distribution');
            $table->enum('critical_period', ['morning', 'afternoon', 'evening', 'night'])->nullable()->after('incident_count');
        });
    }
};
