import { Component, Input, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { NgxMaskDirective } from "ngx-mask";
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradoresService } from '../../services/administradores-service'; //importamos el servicio de administradores para usar sus métodos de validación y registro 
import { NotificationService } from '../../services/tools/notification-service';


@Component({
  selector: 'app-registro-admin',
  imports: [
    ...SHARED_IMPORTS,
    NgxMaskDirective
],
  templateUrl: './registro-admin.html',
  styleUrl: './registro-admin.scss',
})
export class RegistroAdmin implements OnInit {

  @Input() rol:string = "";
  @Input() datos_user:any = {};

  public admin: any = {};
  public errors: any = {};
  public editar:boolean = false;
  public idUser: number = 0;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';


  //ideclarsmos cosas en nuestro constructor 
  constructor(
    private location: Location,
    private router: Router,
    private administradoresService: AdministradoresService,
    private notificationService: NotificationService
  ) { }

    ngOnInit() {
    //Inicializar el objeto admin con el esquema definido en el servicio
    this.admin = this.administradoresService.esquemaAdmin();
    //Asignar el rol al admin que se va a registrar o editar
    this.admin.rol = this.rol;
  }


 

  //Funciones para password
  public showPassword()
  {
    if(this.inputType_1 === 'password'){
      this.inputType_1 = 'text';
      this.hide_1 = true;
    }
    else{
      this.inputType_1 = 'password';
      this.hide_1 = false;
    }
  }

  public showPwdConfirmar()
  {
    if(this.inputType_2 === 'password'){
      this.inputType_2 = 'text';
      this.hide_2 = true;
    }
    else{
      this.inputType_2 = 'password';
      this.hide_2 = false;
    }
  }

  public regresar(){
    this.location.back();
  }


  public registrar(){
    //Inicializo el objeto de errores para evitar que se muestren errores anteriores o datos anteriores al momento de registrar un nuevo admin
    this.errors = {};
    console.log("Datos del admin: ", this.admin);

    // Validar datos y mostrar errores
    this.errors = this.administradoresService.validarAdmin(this.admin, this.editar);
    //Verificamos si el objeto de errores está vacío, lo que indica que no hay errores de validación
    if(Object.keys(this.errors).length > 0){
      return;
    }

    // Validar si las contraseñas coinciden solo si no se está editando, ya que en la edición no es obligatorio cambiar la contraseña
    if(this.admin.password === this.admin.confirmar_password){
      // TODO: Aquí iría la lógica para registrar al administrador, como llamar a un servicio que se encargue de hacer la petición al backend
      this.administradoresService.registrarAdmin(this.admin).subscribe({
        next: (response) => {
          this.notificationService.success("Administrador registrado exitosamente");
          console.log(response);
          //Si se registra correctamente, redirigimos al login
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error("Error al registrar administrador: ", error);
          this.notificationService.error("Error al registrar administrador");
        }
      });
    }else{
      this.notificationService.error("Las contraseñas no coinciden");
      this.admin.password="";
      this.admin.confirmar_password="";
    }

  }

  public actualizar(){

  }

}