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
        Schema::create('zones_a_risque', function (Blueprint $table) {
            $table->id();
            $table->enum('zone_type', ['accident_prone', 'congested', 'flood_prone']);
            $table->float('latitude');
            $table->float('longitude');
            $table->string('city');
            $table->string('district')->nullable();
            $table->unsignedInteger('incident_count');
            $table->enum('critical_period', ['morning', 'afternoon', 'evening', 'night']);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('zones_a_risque');
    }
};
