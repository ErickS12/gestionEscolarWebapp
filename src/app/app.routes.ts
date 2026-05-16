import { Routes } from '@angular/router';

export const routes: Routes = [
    {path:'',redirectTo:'login',pathMatch:'full'},
    {
        path:'login',
        loadComponent:() => import('./screens/login-screen/login-screen').then(m=>m.LoginScreen),
    },
    {
        path :'registro-usuarios-screen',
        loadComponent:() => import('./screens/registro-usuarios-screen/registro-usuarios-screen').then(m=>m.RegistroUsuariosScreen),
    },
    {
    path: 'home',
    loadComponent: () => import('./screens/home-screen/home-screen').then(m => m.HomeScreen),
    },
  // TODO:Agregar la forma correcta de rutas con el Auth-layout y el Dashboard-layout para cada tipo de usuario (administrador, maestro, alumno)

    {path:'**',redirectTo:'login'}
];

