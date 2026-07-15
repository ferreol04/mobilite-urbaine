<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TypeIncidentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            // Accidents et incidents graves
            ['category' => 'Accidents et incidents graves',        'name' => 'Accident de circulation',         'icon' => 'accident',          'disappearance_mode' => 'automatic', 'validity_duration' => 60],
            ['category' => 'Accidents et incidents graves',        'name' => 'Véhicule renversé',               'icon' => 'car_overturned',     'disappearance_mode' => 'report',    'validity_duration' => null],
            ['category' => 'Accidents et incidents graves',        'name' => 'Incendie de véhicule',            'icon' => 'car_fire',           'disappearance_mode' => 'report',    'validity_duration' => null],

            // Pannes et obstacles sur la route
            ['category' => 'Pannes et obstacles sur la route',    'name' => 'Véhicule en panne',               'icon' => 'car_breakdown',      'disappearance_mode' => 'automatic', 'validity_duration' => 120],
            ['category' => 'Pannes et obstacles sur la route',    'name' => 'Camion bloqué',                   'icon' => 'truck_blocked',      'disappearance_mode' => 'report',    'validity_duration' => null],
            ['category' => 'Pannes et obstacles sur la route',    'name' => 'Objet dangereux sur la chaussée', 'icon' => 'road_hazard',        'disappearance_mode' => 'automatic', 'validity_duration' => 45],
            ['category' => 'Pannes et obstacles sur la route',    'name' => 'Véhicule mal stationné',          'icon' => 'wrong_parking',      'disappearance_mode' => 'automatic', 'validity_duration' => 60],

            // Travaux et dégradations routières
            ['category' => 'Travaux et dégradations routières',   'name' => 'Travaux en cours sur la route',  'icon' => 'road_works',         'disappearance_mode' => 'report',    'validity_duration' => null],
            ['category' => 'Travaux et dégradations routières',   'name' => 'Route déviée',                   'icon' => 'road_detour',        'disappearance_mode' => 'report',    'validity_duration' => null],
            ['category' => 'Travaux et dégradations routières',   'name' => 'Chaussée endommagée',            'icon' => 'damaged_road',       'disappearance_mode' => 'report',    'validity_duration' => null],
            ['category' => 'Travaux et dégradations routières',   'name' => 'Caniveau ouvert',                'icon' => 'open_drain',         'disappearance_mode' => 'report',    'validity_duration' => null],

            // Conditions météorologiques dangereuses
            ['category' => 'Conditions météorologiques dangereuses', 'name' => 'Route inondée',               'icon' => 'flooded_road',       'disappearance_mode' => 'automatic', 'validity_duration' => 180],

            // Problèmes de signalisation
            ['category' => 'Problèmes de signalisation',          'name' => 'Feux tricolores en panne',       'icon' => 'traffic_light_down', 'disappearance_mode' => 'report',    'validity_duration' => null],

            // Embouteillages et blocages
            ['category' => 'Embouteillages et blocages',          'name' => 'Gros embouteillage',             'icon' => 'traffic_jam',        'disappearance_mode' => 'automatic', 'validity_duration' => 60],
            ['category' => 'Embouteillages et blocages',          'name' => 'Route bloquée',                  'icon' => 'road_blocked',       'disappearance_mode' => 'report',    'validity_duration' => null],

            // Événements perturbateurs
            ['category' => 'Événements perturbateurs',            'name' => 'Manifestation',                  'icon' => 'protest',            'disappearance_mode' => 'automatic', 'validity_duration' => 120],
            ['category' => 'Événements perturbateurs',            'name' => 'Rassemblement',                  'icon' => 'gathering',          'disappearance_mode' => 'automatic', 'validity_duration' => 120],
        ];

        foreach ($types as $type) {
            $category = \App\Models\Category::where('name', $type['category'])->first();
            \App\Models\TypeIncident::updateOrCreate(
                ['name' => $type['name']],
                [
                    'category_id'        => $category->id,
                    'icon'               => $type['icon'],
                    'disappearance_mode' => $type['disappearance_mode'],
                    'validity_duration'  => $type['validity_duration'],
                    'is_active'          => true,
                ]
            );
        }
    }
}
