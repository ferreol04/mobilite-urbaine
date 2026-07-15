<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // MySQL met automatiquement ON UPDATE CURRENT_TIMESTAMP sur le premier
        // champ TIMESTAMP sans valeur par défaut explicite, ce qui réinitialise
        // reported_at à chaque UPDATE. On le fixe en lui donnant un DEFAULT NULL.
        \DB::statement('ALTER TABLE alertes MODIFY reported_at TIMESTAMP NULL DEFAULT NULL');
    }

    public function down(): void
    {
        \DB::statement('ALTER TABLE alertes MODIFY reported_at TIMESTAMP NOT NULL');
    }
};
