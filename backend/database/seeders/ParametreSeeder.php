<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ParametreSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $parametres = [
            ['key' => 'seuil_confirmation_modification', 'value' => '3',   'description' => 'Nb de confirmations pour bloquer la modification'],
            ['key' => 'seuil_signalement_termine',       'value' => '3',   'description' => 'Nb de signalements terminé pour disparition'],
            ['key' => 'seuil_signalement_fausse',        'value' => '3',   'description' => 'Nb de signalements fausse pour disparition'],
            ['key' => 'rayon_zone_risque',               'value' => '100', 'description' => 'Rayon en mètres pour les zones à risque'],
            ['key' => 'seuil_accidents_zone',            'value' => '5',   'description' => 'Nb min d\'accidents pour zone accidentogène'],
            ['key' => 'seuil_embouteillages_zone',       'value' => '10',  'description' => 'Nb min d\'embouteillages pour zone embouteillée'],
            ['key' => 'seuil_inondations_zone',          'value' => '3',   'description' => 'Nb min d\'inondations pour zone inondable'],
            ['key' => 'jours_analyse_zone',              'value' => '30',  'description' => 'Période d\'analyse en jours'],
            ['key' => 'jours_distincts_accidents',       'value' => '3',   'description' => 'Nb min de jours distincts pour zone accidentogène'],
            ['key' => 'jours_distincts_embouteillages',  'value' => '5',   'description' => 'Nb min de jours distincts pour zone embouteillée'],
            ['key' => 'jours_distincts_inondations',     'value' => '2',   'description' => 'Nb min de jours distincts pour zone inondable'],
            ['key' => 'delai_modification',              'value' => '15',  'description' => 'Délai en minutes pour modifier une alerte'],
            ['key' => 'delai_interaction',               'value' => '120', 'description' => 'Délai en minutes entre deux interactions du même type'],
        ];

        foreach ($parametres as $parametre) {
            \App\Models\Parametre::updateOrCreate(['key' => $parametre['key']], $parametre);
        }
    }
}
