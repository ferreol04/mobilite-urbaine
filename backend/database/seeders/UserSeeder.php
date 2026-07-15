<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $users = [
            [
                'last_name'         => 'Ahouansou',
                'first_name'        => 'Koffi',
                'gender'            => 'male',
                'email'             => 'koffi.ahouansou@gmail.com',
                'phone'             => '+22961000001',
                'status'            => 'active',
                'registration_date' => now()->subDays(30),
            ],
            [
                'last_name'         => 'Dossou',
                'first_name'        => 'Mariam',
                'gender'            => 'female',
                'email'             => 'mariam.dossou@gmail.com',
                'phone'             => '+22961000002',
                'status'            => 'active',
                'registration_date' => now()->subDays(20),
            ],
            [
                'last_name'         => 'Hounkpatin',
                'first_name'        => 'Serge',
                'gender'            => 'male',
                'email'             => null,
                'phone'             => '+22961000003',
                'status'            => 'active',
                'registration_date' => now()->subDays(15),
            ],
            [
                'last_name'         => 'Agossou',
                'first_name'        => 'Fatima',
                'gender'            => 'female',
                'email'             => 'fatima.agossou@yahoo.fr',
                'phone'             => null,
                'status'            => 'suspended',
                'registration_date' => now()->subDays(10),
            ],
        ];

        foreach ($users as $data) {
            \App\Models\User::updateOrCreate(
                ['email' => $data['email'], 'phone' => $data['phone']],
                array_merge($data, [
                    'password' => bcrypt('Password123'),
                    'role'     => 'user',
                ])
            );
        }
    }
}
