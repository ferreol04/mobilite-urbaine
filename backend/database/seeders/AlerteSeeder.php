<?php

namespace Database\Seeders;

use App\Models\Alerte;
use App\Models\Interaction;
use App\Models\TypeIncident;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AlerteSeeder extends Seeder
{
    /** @var User[] */
    private array $users = [];

    public function run(): void
    {
        // Désactiver l'observer pour éviter un recalcul de zone à chaque alerte insérée.
        // Le ZoneARisqueSeeder appelé juste après fait un recalcul global une seule fois.
        Alerte::withoutEvents(function () {
            $this->seedAll();
        });
    }

    private function seedAll(): void
    {
        $this->users = $this->createUsers();

        $accident      = TypeIncident::where('name', 'Accident de circulation')->first();
        $embouteillage = TypeIncident::where('name', 'Gros embouteillage')->first();
        $inondation    = TypeIncident::where('name', 'Route inondée')->first();
        $panne         = TypeIncident::where('name', 'Véhicule en panne')->first();
        $chaussee      = TypeIncident::where('name', 'Chaussée endommagée')->first();
        $feux          = TypeIncident::where('name', 'Feux tricolores en panne')->first();
        $manifestation = TypeIncident::where('name', 'Manifestation')->first();

        // -----------------------------------------------------------------------
        // CLUSTERS HISTORIQUES — dans les 30 derniers jours, satisfont les seuils
        // daysAgo = jours avant aujourd'hui, toujours dans la fenêtre glissante des 30j
        // -----------------------------------------------------------------------

        // Zone 1 : Cotonou Cadjehoun — accident_prone (morning)
        // 7 accidents sur 5 jours distincts (seuil : >= 5 accidents, >= 3 jours)
        $this->seedHistoricalCluster($accident, 'Cotonou', [
            ['lat' => 6.3654, 'lon' => 2.4183, 'daysAgo' => 25, 'hour' => 8,  'min' => 30, 'loc' => 'Carrefour Cadjehoun, en face de la pharmacie centrale'],
            ['lat' => 6.3655, 'lon' => 2.4184, 'daysAgo' => 25, 'hour' => 9,  'min' => 15, 'loc' => 'Rue de Cadjehoun, près du supermarché Erevan'],
            ['lat' => 6.3653, 'lon' => 2.4182, 'daysAgo' => 19, 'hour' => 7,  'min' => 45, 'loc' => 'Intersection Cadjehoun – Zone Résidentielle, à hauteur du garage Total'],
            ['lat' => 6.3656, 'lon' => 2.4183, 'daysAgo' => 13, 'hour' => 10, 'min' => 0,  'loc' => 'Voie principale de Cadjehoun, entre le marché et le stade'],
            ['lat' => 6.3654, 'lon' => 2.4185, 'daysAgo' => 13, 'hour' => 8,  'min' => 20, 'loc' => 'Carrefour Cadjehoun, devant la banque BOA'],
            ['lat' => 6.3652, 'lon' => 2.4181, 'daysAgo' => 7,  'hour' => 9,  'min' => 10, 'loc' => 'Route de l\'Aéroport, au niveau du feu tricolore de Cadjehoun'],
            ['lat' => 6.3655, 'lon' => 2.4183, 'daysAgo' => 3,  'hour' => 11, 'min' => 5,  'loc' => 'Carrefour Cadjehoun, sortie vers l\'aéroport'],
        ]);

        // Zone 2 : Cotonou Akpakpa — accident_prone (evening)
        // 6 accidents sur 4 jours distincts (seuil : >= 5 accidents, >= 3 jours)
        $this->seedHistoricalCluster($accident, 'Cotonou', [
            ['lat' => 6.3730, 'lon' => 2.4320, 'daysAgo' => 27, 'hour' => 18, 'min' => 30, 'loc' => 'Carrefour Akpakpa, pont sur le lac Nokoué, direction PK3'],
            ['lat' => 6.3731, 'lon' => 2.4321, 'daysAgo' => 27, 'hour' => 19, 'min' => 0,  'loc' => 'Boulevard de la Marina côté Akpakpa, devant l\'hôtel du Lac'],
            ['lat' => 6.3729, 'lon' => 2.4319, 'daysAgo' => 20, 'hour' => 20, 'min' => 15, 'loc' => 'Rue d\'Akpakpa, à proximité du marché Missèbo'],
            ['lat' => 6.3732, 'lon' => 2.4320, 'daysAgo' => 14, 'hour' => 18, 'min' => 45, 'loc' => 'Intersection PK3 Akpakpa, en face du commissariat'],
            ['lat' => 6.3730, 'lon' => 2.4322, 'daysAgo' => 14, 'hour' => 21, 'min' => 0,  'loc' => 'Voie longeant le canal d\'Akpakpa, côté marché'],
            ['lat' => 6.3728, 'lon' => 2.4320, 'daysAgo' => 8,  'hour' => 19, 'min' => 30, 'loc' => 'Carrefour Akpakpa centre, devant le lycée technique'],
        ]);

        // Zone 3 : Cotonou Tokpa — congested (morning)
        // 12 embouteillages sur 7 jours distincts (seuil : >= 10, >= 5 jours)
        $this->seedHistoricalCluster($embouteillage, 'Cotonou', [
            ['lat' => 6.3612, 'lon' => 2.4271, 'daysAgo' => 28, 'hour' => 7,  'min' => 0,  'loc' => 'Marché Tokpa, entrée principale côté gare de bus'],
            ['lat' => 6.3613, 'lon' => 2.4272, 'daysAgo' => 28, 'hour' => 8,  'min' => 30, 'loc' => 'Rue du marché Tokpa, entre le débarcadère et la gare routière'],
            ['lat' => 6.3611, 'lon' => 2.4270, 'daysAgo' => 24, 'hour' => 7,  'min' => 15, 'loc' => 'Accès nord du marché Dantokpa, face à la station Shell'],
            ['lat' => 6.3614, 'lon' => 2.4271, 'daysAgo' => 24, 'hour' => 9,  'min' => 0,  'loc' => 'Carrefour Tokpa, intersection avec le boulevard Saint-Michel'],
            ['lat' => 6.3612, 'lon' => 2.4273, 'daysAgo' => 18, 'hour' => 8,  'min' => 0,  'loc' => 'Abords du marché Dantokpa, voie de sortie direction Akpakpa'],
            ['lat' => 6.3610, 'lon' => 2.4271, 'daysAgo' => 18, 'hour' => 7,  'min' => 30, 'loc' => 'Rue longeant le marché Tokpa, côté boulangerie centrale'],
            ['lat' => 6.3613, 'lon' => 2.4270, 'daysAgo' => 13, 'hour' => 8,  'min' => 45, 'loc' => 'Entrée du marché Tokpa par le pont de Cotonou'],
            ['lat' => 6.3611, 'lon' => 2.4272, 'daysAgo' => 9,  'hour' => 7,  'min' => 0,  'loc' => 'Débarcadère de Tokpa, voie d\'accès aux pirogues'],
            ['lat' => 6.3614, 'lon' => 2.4272, 'daysAgo' => 9,  'hour' => 9,  'min' => 15, 'loc' => 'Marché Dantokpa, sortie direction centre-ville'],
            ['lat' => 6.3612, 'lon' => 2.4270, 'daysAgo' => 5,  'hour' => 8,  'min' => 0,  'loc' => 'Carrefour Tokpa, entre la poste et la cathédrale'],
            ['lat' => 6.3610, 'lon' => 2.4273, 'daysAgo' => 5,  'hour' => 7,  'min' => 45, 'loc' => 'Voie parallèle au marché Tokpa, côté lagune'],
            ['lat' => 6.3613, 'lon' => 2.4271, 'daysAgo' => 2,  'hour' => 8,  'min' => 30, 'loc' => 'Intersection Tokpa – Boulevard de la République'],
        ]);

        // Zone 4 : Abomey-Calavi — congested (afternoon)
        // 11 embouteillages sur 6 jours distincts (seuil : >= 10, >= 5 jours)
        $this->seedHistoricalCluster($embouteillage, 'Abomey-Calavi', [
            ['lat' => 6.4487, 'lon' => 2.3559, 'daysAgo' => 27, 'hour' => 13, 'min' => 0,  'loc' => 'Carrefour Calavi, entrée du campus de l\'UAC côté marché'],
            ['lat' => 6.4488, 'lon' => 2.3560, 'daysAgo' => 27, 'hour' => 15, 'min' => 30, 'loc' => 'Route nationale inter-États, à hauteur de la station Oryx d\'Abomey-Calavi'],
            ['lat' => 6.4486, 'lon' => 2.3558, 'daysAgo' => 22, 'hour' => 14, 'min' => 0,  'loc' => 'Voie principale d\'Abomey-Calavi, entre la mairie et la gare zémidjan'],
            ['lat' => 6.4489, 'lon' => 2.3559, 'daysAgo' => 22, 'hour' => 16, 'min' => 0,  'loc' => 'Intersection RNIE1, devant le lycée technique d\'Abomey-Calavi'],
            ['lat' => 6.4487, 'lon' => 2.3561, 'daysAgo' => 16, 'hour' => 13, 'min' => 30, 'loc' => 'Marché d\'Abomey-Calavi, sortie direction Cotonou'],
            ['lat' => 6.4485, 'lon' => 2.3559, 'daysAgo' => 16, 'hour' => 15, 'min' => 0,  'loc' => 'Carrefour université, face à la pharmacie de l\'UAC'],
            ['lat' => 6.4488, 'lon' => 2.3558, 'daysAgo' => 11, 'hour' => 14, 'min' => 30, 'loc' => 'Route de Godomey, croisement avec la rue du marché central'],
            ['lat' => 6.4486, 'lon' => 2.3560, 'daysAgo' => 11, 'hour' => 16, 'min' => 30, 'loc' => 'Abords de la gare de bus Abomey-Calavi, côté terminal'],
            ['lat' => 6.4487, 'lon' => 2.3559, 'daysAgo' => 6,  'hour' => 13, 'min' => 0,  'loc' => 'RNIE1, entre le péage de Calavi et la sortie vers Togba'],
            ['lat' => 6.4489, 'lon' => 2.3560, 'daysAgo' => 6,  'hour' => 15, 'min' => 45, 'loc' => 'Voie rapide d\'Abomey-Calavi, à hauteur du centre commercial'],
            ['lat' => 6.4487, 'lon' => 2.3557, 'daysAgo' => 2,  'hour' => 14, 'min' => 0,  'loc' => 'Entrée principale de l\'université d\'Abomey-Calavi, route bitumée'],
        ]);

        // Zone 5 : Cotonou Fidjrossè — flood_prone (night)
        // 4 inondations sur 3 jours distincts (seuil : >= 3, >= 2 jours)
        $this->seedHistoricalCluster($inondation, 'Cotonou', [
            ['lat' => 6.3800, 'lon' => 2.3900, 'daysAgo' => 15, 'hour' => 23, 'min' => 0,  'loc' => 'Rue de Fidjrossè, à proximité de la plage, voie inondée sur 200m'],
            ['lat' => 6.3801, 'lon' => 2.3901, 'daysAgo' => 14, 'hour' => 0,  'min' => 30, 'loc' => 'Fidjrossè Beach, accès principal depuis le boulevard de la Marina'],
            ['lat' => 6.3799, 'lon' => 2.3899, 'daysAgo' => 8,  'hour' => 22, 'min' => 30, 'loc' => 'Quartier Fidjrossè, intersection avec la voie de drainage principale'],
            ['lat' => 6.3802, 'lon' => 2.3900, 'daysAgo' => 8,  'hour' => 23, 'min' => 45, 'loc' => 'Route côtière de Fidjrossè, entre le bar La Cloche et la résidence SONEB'],
        ]);

        // Zone 6 : Porto-Novo Ouando — flood_prone (evening)
        // 4 inondations sur 2 jours distincts (seuil : >= 3, >= 2 jours)
        $this->seedHistoricalCluster($inondation, 'Porto-Novo', [
            ['lat' => 6.4969, 'lon' => 2.6289, 'daysAgo' => 17, 'hour' => 19, 'min' => 0,  'loc' => 'Quartier Ouando, rue principale en face du collège technique'],
            ['lat' => 6.4970, 'lon' => 2.6290, 'daysAgo' => 17, 'hour' => 20, 'min' => 30, 'loc' => 'Ouando marché, accès depuis la route de Sèmè'],
            ['lat' => 6.4968, 'lon' => 2.6288, 'daysAgo' => 11, 'hour' => 18, 'min' => 45, 'loc' => 'Carrefour Ouando, intersection avec la voie secondaire vers Agbokou'],
            ['lat' => 6.4971, 'lon' => 2.6289, 'daysAgo' => 11, 'hour' => 21, 'min' => 0,  'loc' => 'Route de Ouando, entre le dépôt pétrolier et le CHP de Porto-Novo'],
        ]);

        // Zone 7 : Parakou — accident_prone (night)
        // 6 accidents sur 5 jours distincts (seuil : >= 5, >= 3 jours)
        $this->seedHistoricalCluster($accident, 'Parakou', [
            ['lat' => 9.3370, 'lon' => 2.6280, 'daysAgo' => 26, 'hour' => 23, 'min' => 0,  'loc' => 'Route nationale RN2, entrée de Parakou côté sud, carrefour de Guéma'],
            ['lat' => 9.3371, 'lon' => 2.6281, 'daysAgo' => 25, 'hour' => 0,  'min' => 15, 'loc' => 'Boulevard du 26 Octobre à Parakou, devant le tribunal de première instance'],
            ['lat' => 9.3369, 'lon' => 2.6279, 'daysAgo' => 19, 'hour' => 22, 'min' => 30, 'loc' => 'RN2 Parakou, à hauteur du stade Mathieu Kérékou'],
            ['lat' => 9.3372, 'lon' => 2.6280, 'daysAgo' => 12, 'hour' => 23, 'min' => 45, 'loc' => 'Voie principale de Parakou, carrefour centre commercial Erevan Nord'],
            ['lat' => 9.3370, 'lon' => 2.6282, 'daysAgo' => 11, 'hour' => 1,  'min' => 0,  'loc' => 'RN2, sortie nord de Parakou, entre la gare routière et le marché Arzèkè'],
            ['lat' => 9.3368, 'lon' => 2.6280, 'daysAgo' => 5,  'hour' => 0,  'min' => 30, 'loc' => 'Carrefour Parakou-centre, intersection avec la route vers Bembèrèkè'],
        ]);

        // -----------------------------------------------------------------------
        // ALERTES ACTIVES — visibles sur la carte et la page signalement maintenant
        // -----------------------------------------------------------------------
        $this->seedActiveAlertes($accident, $embouteillage, $inondation, $panne, $chaussee, $feux, $manifestation);
    }

    // -------------------------------------------------------------------------

    private function createUsers(): array
    {
        $data = [
            ['last_name' => 'Ahouansou', 'first_name' => 'Koffi',     'gender' => 'male',   'email' => 'koffi.ahouansou@test.bj',   'phone' => '97100001'],
            ['last_name' => 'Dossou',    'first_name' => 'Amina',     'gender' => 'female', 'email' => 'amina.dossou@test.bj',       'phone' => '97100002'],
            ['last_name' => 'Hounkpatin','first_name' => 'Séraphin',  'gender' => 'male',   'email' => 'seraphin.h@test.bj',         'phone' => '97100003'],
            ['last_name' => 'Gbaguidi',  'first_name' => 'Mariette',  'gender' => 'female', 'email' => 'mariette.gbaguidi@test.bj',  'phone' => '97100004'],
            ['last_name' => 'Vodouhe',   'first_name' => 'Rodrigue',  'gender' => 'male',   'email' => 'rodrigue.v@test.bj',         'phone' => '97100005'],
            ['last_name' => 'Adjovi',    'first_name' => 'Célestine', 'gender' => 'female', 'email' => 'celestine.adjovi@test.bj',   'phone' => '97100006'],
            ['last_name' => 'Houeto',    'first_name' => 'Patrice',   'gender' => 'male',   'email' => 'patrice.houeto@test.bj',     'phone' => '97100007'],
            ['last_name' => 'Azonhiho',  'first_name' => 'Fatimata',  'gender' => 'female', 'email' => 'fatimata.a@test.bj',         'phone' => '97100008'],
        ];

        $users = [];
        foreach ($data as $i => $d) {
            $users[] = User::create([
                'last_name'         => $d['last_name'],
                'first_name'        => $d['first_name'],
                'gender'            => $d['gender'],
                'email'             => $d['email'],
                'phone'             => $d['phone'],
                'password'          => Hash::make('Password123'),
                'role'              => 'user',
                'status'            => 'active',
                'registration_date' => Carbon::now()->subDays(60 + $i * 15),
            ]);
        }

        return $users;
    }

    /**
     * Crée un cluster d'alertes historiques (expirées) qui alimentent le calcul des zones à risque.
     * Chaque point est placé dans un rayon de 100m (≈ 0.0009°) autour du centre de la zone.
     * daysAgo = nombre de jours avant aujourd'hui — reste toujours dans la fenêtre des 30j.
     */
    private function seedHistoricalCluster(TypeIncident $type, string $city, array $points): void
    {
        foreach ($points as $i => $p) {
            $reportedAt = Carbon::now()
                ->subDays($p['daysAgo'])
                ->setHour($p['hour'])
                ->setMinute($p['min'])
                ->setSecond(0);

            $expiresAt = $type->validity_duration
                ? $reportedAt->copy()->addMinutes($type->validity_duration)
                : null;

            // Cycle à travers les utilisateurs en évitant le premier (réservé aux alertes actives)
            $reporter     = $this->users[($i + 1) % count($this->users)];
            $confirmCount = ($i % 3) + 1; // 1, 2 ou 3 confirmations

            $alerte = Alerte::create([
                'user_id'              => $reporter->id,
                'category_id'          => $type->category_id,
                'type_incident_id'     => $type->id,
                'description'          => $this->pickDescription($type->name),
                'latitude'             => $p['lat'],
                'longitude'            => $p['lon'],
                'city'                 => $city,
                'location_description' => $p['loc'],
                'status'               => 'expired',
                'reported_at'          => $reportedAt,
                'expires_at'           => $expiresAt,
                'confirmation_count'   => $confirmCount,
                'false_report_count'   => 0,
                'resolved_report_count'=> 0,
            ]);

            // Interactions de confirmation — utilisateurs différents, espacées de 130min (> délai de 120min)
            for ($j = 0; $j < $confirmCount; $j++) {
                $confirmer = $this->users[($i + $j + 2) % count($this->users)];
                Interaction::create([
                    'alerte_id'     => $alerte->id,
                    'user_id'       => $confirmer->id,
                    'type'          => 'confirmation',
                    'interacted_at' => $reportedAt->copy()->addMinutes(10 + $j * 130),
                ]);
            }
        }
    }

    /**
     * Crée des alertes actives visibles sur la carte et la page signalement.
     */
    private function seedActiveAlertes(
        TypeIncident $accident,
        TypeIncident $embouteillage,
        TypeIncident $inondation,
        TypeIncident $panne,
        TypeIncident $chaussee,
        TypeIncident $feux,
        TypeIncident $manifestation
    ): void {
        $now = Carbon::now();

        $activeData = [
            // --- Cotonou : accidents actifs ---
            [
                'type'        => $accident,
                'city'        => 'Cotonou',
                'lat'         => 6.3680,
                'lon'         => 2.4200,
                'desc'        => 'Accident impliquant deux motos à l\'intersection, circulation ralentie.',
                'loc'         => 'Carrefour Zongo, intersection entre l\'avenue Steinmetz et la rue des Cheminots',
                'reported_at' => $now->copy()->subMinutes(20),
                'confirms'    => 2,
            ],
            [
                'type'        => $accident,
                'city'        => 'Cotonou',
                'lat'         => 6.3615,
                'lon'         => 2.4100,
                'desc'        => 'Collision entre un camion et un taxi-moto devant le marché, blessés légers.',
                'loc'         => 'Boulevard Saint-Michel, à hauteur du marché Saint-Michel, en face de la SGBE',
                'reported_at' => $now->copy()->subMinutes(35),
                'confirms'    => 3,
            ],
            // --- Cotonou : embouteillages actifs ---
            [
                'type'        => $embouteillage,
                'city'        => 'Cotonou',
                'lat'         => 6.3570,
                'lon'         => 2.4360,
                'desc'        => 'Embouteillage monstre sur la voie longeant le marché Dantokpa, attente de plus de 40 minutes.',
                'loc'         => 'Rue longeant le marché Dantokpa côté est, entre le pont de Cotonou et le carrefour Missèbo',
                'reported_at' => $now->copy()->subMinutes(25),
                'confirms'    => 5,
            ],
            [
                'type'        => $embouteillage,
                'city'        => 'Cotonou',
                'lat'         => 6.3700,
                'lon'         => 2.3950,
                'desc'        => 'Trafic dense au carrefour Cadjehoun suite à des travaux de voirie.',
                'loc'         => 'Carrefour Cadjehoun, devant la station Total, direction route de l\'Aéroport',
                'reported_at' => $now->copy()->subMinutes(10),
                'confirms'    => 1,
            ],
            // --- Porto-Novo ---
            [
                'type'        => $panne,
                'city'        => 'Porto-Novo',
                'lat'         => 6.4900,
                'lon'         => 2.6150,
                'desc'        => 'Camion en panne au milieu de la route, une voie bloquée depuis 1 heure.',
                'loc'         => 'Avenue de la Victoire à Porto-Novo, entre le rond-point central et la préfecture de l\'Ouémé',
                'reported_at' => $now->copy()->subMinutes(55),
                'confirms'    => 2,
            ],
            [
                'type'        => $accident,
                'city'        => 'Porto-Novo',
                'lat'         => 6.4940,
                'lon'         => 2.6210,
                'desc'        => 'Accrochage entre deux véhicules, débris sur la chaussée.',
                'loc'         => 'Route de l\'Ouémé, à proximité du palais royal de Porto-Novo, direction Sèmè',
                'reported_at' => $now->copy()->subMinutes(40),
                'confirms'    => 1,
            ],
            // --- Abomey-Calavi ---
            [
                'type'        => $embouteillage,
                'city'        => 'Abomey-Calavi',
                'lat'         => 6.4500,
                'lon'         => 2.3480,
                'desc'        => 'Embouteillage à l\'entrée du campus d\'Abomey-Calavi, nombreux étudiants bloqués.',
                'loc'         => 'RNIE1, entrée principale de l\'Université d\'Abomey-Calavi, face au portail administratif',
                'reported_at' => $now->copy()->subMinutes(15),
                'confirms'    => 4,
            ],
            // --- Parakou ---
            [
                'type'        => $accident,
                'city'        => 'Parakou',
                'lat'         => 9.3400,
                'lon'         => 2.6300,
                'desc'        => 'Accident grave sur la route nationale, ambulance sur place.',
                'loc'         => 'RN2 à Parakou, entre le carrefour du marché Arzèkè et la gare ferroviaire OCBN',
                'reported_at' => $now->copy()->subMinutes(50),
                'confirms'    => 3,
            ],
            // --- Alertes par signalement (mode_disparition = report) ---
            [
                'type'        => $chaussee,
                'city'        => 'Cotonou',
                'lat'         => 6.3640,
                'lon'         => 2.4050,
                'desc'        => 'Grande partie de la chaussée effondrée, nids de poule dangereux sur 50m.',
                'loc'         => 'Rue de la Croix-Rouge à Cotonou, entre le carrefour Jéricho et l\'hôpital de la Croix-Rouge',
                'reported_at' => $now->copy()->subHours(3),
                'confirms'    => 2,
            ],
            [
                'type'        => $feux,
                'city'        => 'Cotonou',
                'lat'         => 6.3660,
                'lon'         => 2.4260,
                'desc'        => 'Les feux tricolores au carrefour sont éteints depuis ce matin, aucun agent de police présent.',
                'loc'         => 'Carrefour de l\'Étoile Rouge à Cotonou, intersection avenue Jean-Paul II et boulevard de la Marina',
                'reported_at' => $now->copy()->subHours(5),
                'confirms'    => 4,
            ],
            [
                'type'        => $manifestation,
                'city'        => 'Porto-Novo',
                'lat'         => 6.4970,
                'lon'         => 2.6270,
                'desc'        => 'Manifestation de fonctionnaires devant la préfecture, route principale bloquée.',
                'loc'         => 'Devant la préfecture de l\'Ouémé à Porto-Novo, avenue Toffa 1er, accès bloqué des deux côtés',
                'reported_at' => $now->copy()->subHours(2),
                'confirms'    => 3,
            ],
            [
                'type'        => $chaussee,
                'city'        => 'Parakou',
                'lat'         => 9.3350,
                'lon'         => 2.6250,
                'desc'        => 'Route endommagée par les pluies récentes, passage difficile pour les véhicules.',
                'loc'         => 'Route secondaire de Parakou Sud, entre le quartier Ladji et le dépôt de la SONEB',
                'reported_at' => $now->copy()->subHours(6),
                'confirms'    => 1,
            ],
            [
                'type'        => $inondation,
                'city'        => 'Cotonou',
                'lat'         => 6.3810,
                'lon'         => 2.3920,
                'desc'        => 'Route inondée suite aux pluies de la nuit, eau au-dessus des roues.',
                'loc'         => 'Rue de Fidjrossè, à 200m de la plage, passage submergé entre les résidences balnéaires',
                'reported_at' => $now->copy()->subMinutes(30),
                'confirms'    => 2,
            ],
        ];

        foreach ($activeData as $i => $d) {
            $type       = $d['type'];
            $reportedAt = $d['reported_at'];

            // Pour les types automatiques : expires_at dans le futur (prolongé si nécessaire)
            $expiresAt = null;
            if ($type->validity_duration) {
                $computed = $reportedAt->copy()->addMinutes($type->validity_duration);
                // Si l'expiration est déjà passée, on la repousse pour que l'alerte reste active
                $expiresAt = $computed->isPast()
                    ? Carbon::now()->addMinutes(30)
                    : $computed;
            }

            $reporter = $this->users[$i % count($this->users)];

            $alerte = Alerte::create([
                'user_id'              => $reporter->id,
                'category_id'          => $type->category_id,
                'type_incident_id'     => $type->id,
                'description'          => $d['desc'],
                'latitude'             => $d['lat'],
                'longitude'            => $d['lon'],
                'city'                 => $d['city'],
                'location_description' => $d['loc'],
                'status'               => 'active',
                'reported_at'          => $reportedAt,
                'expires_at'           => $expiresAt,
                'confirmation_count'   => $d['confirms'],
                'false_report_count'   => 0,
                'resolved_report_count'=> 0,
            ]);

            // Interactions de confirmation — utilisateurs différents, espacées > 120min
            for ($j = 0; $j < $d['confirms']; $j++) {
                $confirmer = $this->users[($i + $j + 1) % count($this->users)];
                Interaction::create([
                    'alerte_id'     => $alerte->id,
                    'user_id'       => $confirmer->id,
                    'type'          => 'confirmation',
                    'interacted_at' => $reportedAt->copy()->addMinutes(5 + $j * 130),
                ]);
            }
        }
    }

    /**
     * Retourne une description réaliste selon le type d'incident.
     * Utilise crc32 pour une sélection stable (sans rand).
     */
    private function pickDescription(string $typeName): string
    {
        $pool = [
            'Accident de circulation' => [
                'Accident impliquant plusieurs véhicules, route partiellement bloquée.',
                'Collision frontale entre deux motos-taxis, blessés sur place.',
                'Accrochage entre un camion et une voiture, débris sur la route.',
                'Accident grave, forces de l\'ordre présentes sur les lieux.',
                'Renversement d\'un taxi à l\'entrée du carrefour, circulation déviée.',
            ],
            'Gros embouteillage' => [
                'Embouteillage important, circulation quasi à l\'arrêt.',
                'Bouchon de plusieurs kilomètres depuis le carrefour principal.',
                'Trafic dense, prévoir un délai supplémentaire de 30 à 45 minutes.',
                'Circulation bloquée dans les deux sens suite à un incident.',
                'File d\'attente interminable, les zémidjans tentent de passer sur les trottoirs.',
            ],
            'Route inondée' => [
                'La route est inondée suite aux fortes pluies de la nuit.',
                'Eau sur la chaussée, passage impossible pour les petits véhicules.',
                'Inondation importante, des véhicules bloqués en travers de la route.',
                'Chaussée submergée, déviation nécessaire par la voie secondaire.',
            ],
        ];

        $list = $pool[$typeName] ?? ['Incident signalé, soyez prudents.'];

        return $list[abs(crc32($typeName)) % count($list)];
    }
}
