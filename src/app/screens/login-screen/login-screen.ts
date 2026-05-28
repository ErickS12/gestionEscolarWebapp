import { Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { Router } from '@angular/router';
import { AuthServices } from '../../services/auth-services';
import { NotificationService } from '../../services/tools/notification-service';

@Component({
  selector: 'app-login-screen',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './login-screen.html',
  styleUrls: ['./login-screen.scss'],
})
export class LoginScreen implements OnInit{
  // aqui va las variables globales 
  public username:string='';
  public password:string='';
  public load:boolean=false;
  public errors:any={};
  public type:string="password";
  public hide: boolean = false;

  constructor( 
    public router: Router, // el router es para redirigir a otras pantallas
    private authServices: AuthServices, // el authServices es para llamar las funciones de autenticación, como login, logout, etc.
    private notificationService: NotificationService // el notificationService es para mostrar mensajes de éxito, error, etc.
  ){}
  // primera ves que  queremos que se ejecute la aplicacion 
  ngOnInit(): void {
    
  }

  public login(){
    // Inicializo el objeto de errores para evitar que se muestren errores anteriores o datos anteriores al momento de registrar un nuevo admin
    this.errors = {};
    console.log("Datos del user: ", this.username, this.password);
    // Validar datos y mostrar errores
    this.errors = this.authServices.validarLogin(this.username, this.password);
    //Verificamos si el objeto de errores está vacío, lo que indica que no hay errores de validación
    if(Object.keys(this.errors).length > 0){
      return;
    }

    console.log("Pasó la validación");
    this.load = true;
    //Agregamos la función para llamar la función que está en authService y realizar el login
    this.authServices.login(this.username, this.password).subscribe({
      next: (response: any) => {
        console.log("Respuesta del login: ", response);
        // Guardar el token de sesión y los datos del usuario en cookies
        this.authServices.saveUserData(response);
        //Redirigir al usuario a la pantalla principal después de iniciar sesión
        const role = response.rol;
        if (role === 'administrador') {
          this.router.navigate(['home']);
        } else if (role === 'maestro') {
          this.router.navigate(['home']);
        } else if (role === 'alumno') {
          this.router.navigate(['home']);
        } else {
          this.router.navigate(['']);
        }
        this.load = false;
      },
      error: (err: any) => {
        console.log("Error en el login: ", err);
        this.load = false;
        this.notificationService.error("Error en el login: " + (err.message || err));
        if (err && err.status === 401) {
          this.errors.general = "Credenciales incorrectas";
        } else {
          this.errors.general = "Error en el servidor, por favor intenta más tarde";
        }
      }
    });
  }

  //El this.router.navigate(['registro-usuarios-screen']) es para redirigir a la pantalla de registro de usuarios, el nombre entre corchetes es el nombre de la ruta que se definió en el app-routing.module.ts

  //Para hacer que el botón de registrar redirija a la pantalla de registro de usuarios, se crea la función registrar() que llama al router para navegar a la ruta 'registro-usuarios-screen', que es la ruta que se definió para la pantalla de registro de usuarios en el app-routing.module.ts
  public registrar(){
    this.router.navigate(['registro-usuarios-screen']);
  }

  public showPassword(){
    if(this.type === 'password'){
      this.type = 'text';
      this.hide = true;
    }
    else{
      this.type = 'password';
      this.hide = false;
    }
  }


}
