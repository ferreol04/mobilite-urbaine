<?php

namespace Database\Seeders;

use App\Models\Alerte;
use App\Models\TypeIncident;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ZonesArisqueTestSeeder extends Seeder
{
    public function run(): void
    {
        $type  = TypeIncident::where('name', 'Accident de circulation')->firstOrFail();
        $users = User::where('role', 'user')->get();

        $zones = [
            // Zone 1 — Cotonou, Carrefour Cadjehoun — dominante matin
            [
                'center_lat' => 6.3654,
                'center_lng' => 2.4183,
                'city'       => 'Cotonou',
                'district'   => 'Cadjehoun',
                'points'     => [
                    ['dlat' =>  0.0000, 'dlng' =>  0.0000, 'daysAgo' => 9, 'hour' => 7,  'min' => 14, 'user_idx' => 0,
                     'description'          => 'Collision entre un zémidjan et une moto à l\'entrée du carrefour, un blessé léger évacué.',
                     'location_description' => 'Carrefour Cadjehoun, devant la pharmacie centrale, intersection avec l\'avenue du Général de Gaulle.'],
                    ['dlat' =>  0.0004, 'dlng' =>  0.0003, 'daysAgo' => 9, 'hour' => 8,  'min' => 37, 'user_idx' => 1,
                     'description'          => 'Un taxi-moto a percuté un véhicule léger qui débouchait sans céder la priorité, débris sur la voie.',
                     'location_description' => 'Rue de Cadjehoun, à hauteur du supermarché Erevan, 50m après le feu tricolore.'],
                    ['dlat' => -0.0003, 'dlng' =>  0.0004, 'daysAgo' => 7, 'hour' => 9,  'min' => 52, 'user_idx' => 2,
                     'description'          => 'Accrochage entre un camion de livraison et une voiture particulière, voie partiellement obstruée.',
                     'location_description' => 'Avenue Steinmetz côté Cadjehoun, entre la station Total et le garage automobile central.'],
                    ['dlat' =>  0.0005, 'dlng' => -0.0002, 'daysAgo' => 5, 'hour' => 7,  'min' => 28, 'user_idx' => 3,
                     'description'          => 'Renversement d\'un zémidjan suite à une manœuvre brusque d\'un véhicule, circulation déviée.',
                     'location_description' => 'Carrefour Cadjehoun, sortie vers l\'aéroport de Cotonou, face à la BOA.'],
                    ['dlat' => -0.0004, 'dlng' => -0.0003, 'daysAgo' => 5, 'hour' => 10, 'min' => 6,  'user_idx' => 0,
                     'description'          => 'Collision entre un bus de transport en commun et un taxi-moto, deux blessés légers.',
                     'location_description' => 'Entrée du carrefour Cadjehoun depuis la route de l\'aéroport, devant le kiosque de presse.'],
                    ['dlat' =>  0.0002, 'dlng' =>  0.0005, 'daysAgo' => 3,  'hour' => 8,  'min' => 43, 'user_idx' => 1,
                     'description'          => 'Accident impliquant trois véhicules dont un taxi, bouchon formé sur 500m vers le centre-ville.',
                     'location_description' => 'Voie principale de Cadjehoun, carrefour près du marché, avant le feu en direction de Jéricho.'],
                    ['dlat' => -0.0001, 'dlng' =>  0.0002, 'daysAgo' => 1,  'hour' => 11, 'min' => 19, 'user_idx' => 2,
                     'description'          => 'Un véhicule a percuté un poteau électrique après perte de contrôle, voie partiellement bloquée.',
                     'location_description' => 'Rue adjacente au carrefour Cadjehoun, côté agence bancaire UBA, à 30m de l\'intersection.'],
                ],
            ],

            // Zone 2 — Porto-Novo, Carrefour Ouando — dominante après-midi/soir
            [
                'center_lat' => 6.4812,
                'center_lng' => 2.6254,
                'city'       => 'Porto-Novo',
                'district'   => 'Ouando',
                'points'     => [
                    ['dlat' =>  0.0000, 'dlng' =>  0.0000, 'daysAgo' => 10, 'hour' => 14, 'min' => 23, 'user_idx' => 1,
                     'description'          => 'Collision entre deux motos-taxis à l\'heure de pointe, blessé léger sur place.',
                     'location_description' => 'Carrefour Ouando, intersection de la route principale avec la voie vers le marché central.'],
                    ['dlat' =>  0.0003, 'dlng' =>  0.0004, 'daysAgo' => 9, 'hour' => 17, 'min' => 48, 'user_idx' => 2,
                     'description'          => 'Accrochage entre un camion et une voiture particulière, une voie bloquée sur 200m.',
                     'location_description' => 'Route de Ouando, à hauteur de la station Oryx, direction centre de Porto-Novo.'],
                    ['dlat' => -0.0004, 'dlng' =>  0.0003, 'daysAgo' => 7, 'hour' => 15, 'min' => 7,  'user_idx' => 3,
                     'description'          => 'Un zémidjan a été renversé par un véhicule qui grillait le feu, conducteur blessé.',
                     'location_description' => 'Carrefour Ouando marché, en face de la pharmacie Bonne Santé, après le pont.'],
                    ['dlat' =>  0.0005, 'dlng' => -0.0004, 'daysAgo' => 5, 'hour' => 18, 'min' => 31, 'user_idx' => 0,
                     'description'          => 'Carambolage entre trois motos et une voiture, route bloquée sur une voie pendant 45 min.',
                     'location_description' => 'Route principale de Ouando, 200m avant le carrefour, direction Sèmè-Kpodji.'],
                    ['dlat' => -0.0002, 'dlng' => -0.0005, 'daysAgo' => 4, 'hour' => 16, 'min' => 54, 'user_idx' => 1,
                     'description'          => 'Accident grave entre un véhicule personnel et un poids lourd, blessé grave évacué.',
                     'location_description' => 'Route nationale à Ouando, sortie vers Adjarra, à hauteur du dépôt carburant.'],
                    ['dlat' =>  0.0004, 'dlng' =>  0.0002, 'daysAgo' => 2,  'hour' => 13, 'min' => 16, 'user_idx' => 2,
                     'description'          => 'Collision entre un taxi collectif et un zémidjan, deux blessés légers, forces de l\'ordre présentes.',
                     'location_description' => 'Rue du marché de Ouando, à l\'entrée du marché principal, intersection vers Agbokou.'],
                    ['dlat' => -0.0003, 'dlng' =>  0.0001, 'daysAgo' => 1,  'hour' => 19, 'min' => 3,  'user_idx' => 3,
                     'description'          => 'Un automobiliste a perdu le contrôle et terminé sa course dans un caniveau, dégâts matériels.',
                     'location_description' => 'Voie secondaire de Ouando, derrière le lycée technique, en direction du quartier Womey.'],
                ],
            ],

            // Zone 3 — Parakou, Carrefour Guéma — dominante nuit
            [
                'center_lat' => 9.3412,
                'center_lng' => 2.6287,
                'city'       => 'Parakou',
                'district'   => 'Guéma',
                'points'     => [
                    ['dlat' =>  0.0000, 'dlng' =>  0.0000, 'daysAgo' => 11, 'hour' => 22, 'min' => 41, 'user_idx' => 0,
                     'description'          => 'Collision entre deux véhicules sur la route nationale, un blessé, ambulance sur place.',
                     'location_description' => 'RN2 à Parakou, entrée sud côté Guéma, carrefour principal vers le marché Arzèkè.'],
                    ['dlat' =>  0.0004, 'dlng' => -0.0003, 'daysAgo' => 10, 'hour' => 23, 'min' => 17, 'user_idx' => 1,
                     'description'          => 'Renversement d\'un camion après une perte de contrôle, route bloquée sur une voie.',
                     'location_description' => 'Boulevard du 26 Octobre à Parakou, devant le tribunal de première instance.'],
                    ['dlat' => -0.0003, 'dlng' =>  0.0005, 'daysAgo' => 8, 'hour' => 0,  'min' => 8,  'user_idx' => 2,
                     'description'          => 'Accident grave entre un bus et une moto, deux blessés, forces de l\'ordre mobilisées.',
                     'location_description' => 'RN2 Parakou, à hauteur du stade Mathieu Kérékou, direction centre-ville.'],
                    ['dlat' =>  0.0005, 'dlng' =>  0.0004, 'daysAgo' => 6, 'hour' => 23, 'min' => 55, 'user_idx' => 3,
                     'description'          => 'Collision frontale entre deux voitures à la sortie d\'un carrefour mal éclairé.',
                     'location_description' => 'Voie principale de Parakou, carrefour centre commercial Erevan Nord.'],
                    ['dlat' => -0.0004, 'dlng' => -0.0004, 'daysAgo' => 5, 'hour' => 1,  'min' => 33, 'user_idx' => 0,
                     'description'          => 'Un zémidjan percuté par une voiture roulant sans éclairage, blessé léger évacué.',
                     'location_description' => 'RN2, sortie nord de Parakou, entre la gare routière et le marché Arzèkè.'],
                    ['dlat' =>  0.0002, 'dlng' =>  0.0003, 'daysAgo' => 3, 'hour' => 22, 'min' => 9,  'user_idx' => 1,
                     'description'          => 'Accrochage entre un taxi et un camion de livraison, débris sur la chaussée.',
                     'location_description' => 'Carrefour Parakou-centre, intersection avec la route vers Bembèrèkè.'],
                    ['dlat' => -0.0001, 'dlng' => -0.0002, 'daysAgo' => 1,  'hour' => 0,  'min' => 47, 'user_idx' => 2,
                     'description'          => 'Carambolage entre trois motos à la sortie d\'un bar, deux blessés, police sur place.',
                     'location_description' => 'Rue secondaire de Guéma, à 100m du carrefour principal, face à la mosquée centrale.'],
                ],
            ],

            // Zone 4 — Abomey-Calavi, Carrefour Godomey-étoile — dominante matin/après-midi
            [
                'center_lat' => 6.4102,
                'center_lng' => 2.3471,
                'city'       => 'Abomey-Calavi',
                'district'   => 'Godomey',
                'points'     => [
                    ['dlat' =>  0.0000, 'dlng' =>  0.0000, 'daysAgo' => 12, 'hour' => 8,  'min' => 22, 'user_idx' => 3,
                     'description'          => 'Collision entre un bus et un zémidjan à l\'entrée du carrefour étoile, blessés légers.',
                     'location_description' => 'Carrefour Godomey, intersection de la RNIE1 avec la route vers Togba.'],
                    ['dlat' =>  0.0003, 'dlng' =>  0.0004, 'daysAgo' => 10, 'hour' => 12, 'min' => 51, 'user_idx' => 0,
                     'description'          => 'Accrochage entre deux voitures particulières, une voie bloquée, bouchon sur 300m.',
                     'location_description' => 'RNIE1 à Godomey, à hauteur de la station Total, direction Cotonou.'],
                    ['dlat' => -0.0004, 'dlng' =>  0.0003, 'daysAgo' => 8, 'hour' => 9,  'min' => 38, 'user_idx' => 1,
                     'description'          => 'Un taxi-moto a été renversé après avoir évité un nid de poule, conducteur blessé.',
                     'location_description' => 'Carrefour Godomey marché, en face de la pharmacie du marché, après le carrefour.'],
                    ['dlat' =>  0.0005, 'dlng' => -0.0004, 'daysAgo' => 6, 'hour' => 7,  'min' => 4,  'user_idx' => 2,
                     'description'          => 'Carambolage impliquant un camion et deux motos, route partiellement bloquée.',
                     'location_description' => 'Route nationale à Godomey, 200m avant le péage, direction Abomey-Calavi.'],
                    ['dlat' => -0.0002, 'dlng' => -0.0005, 'daysAgo' => 4, 'hour' => 14, 'min' => 17, 'user_idx' => 3,
                     'description'          => 'Accident entre un véhicule personnel et un poids lourd, blessé grave hélitreuillé.',
                     'location_description' => 'Route nationale à Godomey, sortie vers Abomey-Calavi, à hauteur du dépôt SOBEMAP.'],
                    ['dlat' =>  0.0004, 'dlng' =>  0.0002, 'daysAgo' => 3, 'hour' => 11, 'min' => 29, 'user_idx' => 0,
                     'description'          => 'Collision entre un taxi collectif et un zémidjan, deux blessés légers.',
                     'location_description' => 'Rue du marché de Godomey, à l\'entrée principale, intersection vers Togba.'],
                    ['dlat' => -0.0003, 'dlng' =>  0.0001, 'daysAgo' => 1,  'hour' => 8,  'min' => 56, 'user_idx' => 1,
                     'description'          => 'Un automobiliste a perdu le contrôle et percuté un poteau, coupure d\'électricité signalée.',
                     'location_description' => 'Voie secondaire de Godomey, derrière le lycée technique, direction quartier Womey.'],
                ],
            ],
        ];

        foreach ($zones as $zone) {
            foreach ($zone['points'] as $p) {
                $reportedAt = Carbon::now()
                    ->subDays($p['daysAgo'])
                    ->setHour($p['hour'])
                    ->setMinute($p['min'])
                    ->setSecond(0);

                $user = $users[$p['user_idx']];

                Alerte::create([
                    'user_id'              => $user->id,
                    'category_id'          => $type->category_id,
                    'type_incident_id'     => $type->id,
                    'description'          => $p['description'],
                    'location_description' => $p['location_description'],
                    'latitude'             => $zone['center_lat'] + $p['dlat'],
                    'longitude'            => $zone['center_lng'] + $p['dlng'],
                    'city'                 => $zone['city'],
                    'district'             => $zone['district'],
                    'status'               => 'expired',
                    'reported_at'          => $reportedAt,
                    'expires_at'           => $reportedAt->copy()->addMinutes(60),
                ]);
            }
        }

        $this->command->info('28 alertes de test insérées (4 zones × 7 alertes, 3 villes, 4 utilisateurs).');
    }
}
