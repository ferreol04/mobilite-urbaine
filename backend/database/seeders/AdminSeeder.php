<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@mobilite.bj'],
            [
                'last_name'         => 'Admin',
                'first_name'        => 'Super',
                'email'             => 'admin@mobilite.bj',
                'password'          => bcrypt('Admin@1234'),
                'role'              => 'admin',
                'status'            => null,
                'gender'            => null,
                'registration_date' => null,
            ]
        );
    }
}
