<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Colonnes filtrées/triées en permanence par les pages admin
     * (statut, ville, date de signalement, rôle, date d'inscription) mais
     * jamais indexées jusqu'ici. Sans impact notable aux volumes actuels,
     * mais évite une dégradation progressive quand les tables grossiront.
     */
    public function up(): void
    {
        Schema::table('alertes', function (Blueprint $table) {
            $table->index('status');
            $table->index('reported_at');
            $table->index('city');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
            $table->index('status');
            $table->index('registration_date');
        });
    }

    public function down(): void
    {
        Schema::table('alertes', function (Blueprint $table) {
            $table->dropIndex(['status']);
            $table->dropIndex(['reported_at']);
            $table->dropIndex(['city']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
            $table->dropIndex(['status']);
            $table->dropIndex(['registration_date']);
        });
    }
};
