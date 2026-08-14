<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Trace chaque photo uploadée via /temp-upload (avant authentification)
     * avec un jeton propre à cette session d'upload, pour empêcher qu'un
     * utilisateur rattache à sa propre alerte une photo uploadée par
     * quelqu'un d'autre (voir AlerteController::attacherTempPhotos).
     */
    public function up(): void
    {
        Schema::create('temp_uploads', function (Blueprint $table) {
            $table->id();
            $table->string('path')->unique();
            $table->string('token', 64);
            $table->timestamp('created_at')->useCurrent();

            $table->index('token');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('temp_uploads');
    }
};
