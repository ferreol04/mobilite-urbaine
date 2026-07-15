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
        Schema::create('alertes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('restrict');
            $table->foreignId('category_id')->constrained('categories')->onDelete('restrict');
            $table->foreignId('type_incident_id')->constrained('type_incidents')->onDelete('restrict');
            $table->text('description');
            $table->float('latitude');
            $table->float('longitude');
            $table->string('city');
            $table->string('location_description')->nullable();
            $table->enum('status', ['active', 'expired', 'resolved', 'false'])->default('active');
            $table->timestamp('reported_at');
            $table->timestamp('expires_at')->nullable();
            $table->unsignedInteger('confirmation_count')->default(0);
            $table->unsignedInteger('false_report_count')->default(0);
            $table->unsignedInteger('resolved_report_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('alertes');
    }
};
