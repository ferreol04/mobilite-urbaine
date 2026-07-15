<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            'Accidents et incidents graves',
            'Pannes et obstacles sur la route',
            'Travaux et dégradations routières',
            'Conditions météorologiques dangereuses',
            'Problèmes de signalisation',
            'Embouteillages et blocages',
            'Événements perturbateurs',
            'Autres',
        ];

        foreach ($categories as $name) {
            \App\Models\Category::updateOrCreate(['name' => $name], ['name' => $name, 'is_active' => true]);
        }
    }
}
