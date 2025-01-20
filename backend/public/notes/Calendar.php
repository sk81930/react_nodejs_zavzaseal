<?php

namespace App\Filament\Resources\CalendarResource\Pages;

use App\Filament\Resources\CalendarResource;
use Filament\Resources\Pages\Page;
use App\Models\User;
use Spatie\Permission\Models\Role;
use App\Models\DispatcherConsoleTask;

class Calendar extends Page
{
    protected static string $resource = CalendarResource::class;
    protected static string $view = 'filament.resources.calendar-resource.pages.calendar';
     
    public function mount(): void
    {
        $crewRoleId = Role::where('name', 'crew')->first()->id;
        
        $usersWithCrewRole = User::role($crewRoleId)->get();
        
        $task_list =  DispatcherConsoleTask::get()->toArray();
        
        $this->crew = $usersWithCrewRole;
        $this->task_list = $task_list;
    }
    
   
}
