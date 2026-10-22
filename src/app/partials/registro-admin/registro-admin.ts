import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { NgxMaskDirective } from "ngx-mask";
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { AdministradoresService } from '../../services/administradores-service';
import { NotificationService } from '../../services/tools/notification-service';
import { ErrorsService } from '../../services/tools/errors-service';

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

  public form!: FormGroup;
  public errors: any = {};
  public editar:boolean = false;
  public idUser: number = 0;
  public submitted: boolean = false;

  //Para contraseñas
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public inputType_1: string = 'password';
  public inputType_2: string = 'password';

  constructor(
    private location: Location,
    private router: Router,
    private fb: FormBuilder,
    private administradoresService: AdministradoresService,
    private notificationService: NotificationService,
    private activatedRoute: ActivatedRoute,
    private errorsService: ErrorsService
  ) { }


  public categoria: any[] = [
  { value: '1', viewValue: 'Tiempo Completo' },
  { value: '2', viewValue: 'Medio Tiempo' },
  { value: '3', viewValue: 'Hora - Clase' },
  ];

  ngOnInit() {
    //Primero validamos si existe un rol y un id, si es así, estamos en modo edición y cargamos los datos del usuario a editar
    if(this.activatedRoute.snapshot.params['id'] !== undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      //Asignamos los datos del usuario que vienen desde la vista principal con el decorador
      this.form = this.buildForm(this.datos_user);
    }else{
      // Si no va a editar, entonces inicializamos el JSON para registro nuevo
      const admin = this.administradoresService.esquemaAdmin();
      admin.rol = this.rol;
      this.form = this.buildForm(admin);
    }
  }

  private buildForm(admin: any): FormGroup {
    // El formulario reactivo valida la UI; el service conserva la validación final para no cambiar el contrato del backend.
    return this.fb.group({
      rol: [admin?.rol ?? this.rol],
      clave_admin: [admin?.clave_admin ?? '', [Validators.required]],
      first_name: [admin?.first_name ?? '', [Validators.required]],
      last_name: [admin?.last_name ?? '', [Validators.required]],
      email: [{ value: admin?.email ?? '', disabled: this.editar }, [Validators.required, Validators.email, Validators.maxLength(40)]],
      password: [admin?.password ?? '', this.editar ? [] : [Validators.required]],
      confirmar_password: [admin?.confirmar_password ?? '', this.editar ? [] : [Validators.required]],
      telefono: [admin?.telefono ?? '', [Validators.required]],
      rfc: [admin?.rfc ?? '', [Validators.required, Validators.minLength(12), Validators.maxLength(13)]],
      edad: [admin?.edad ?? '', [Validators.required, Validators.min(18)]],
      ocupacion: [admin?.ocupacion ?? '', [Validators.required]],
      categoria: [admin?.categoria ?? '', [Validators.required]],
      grado_academico: [admin?.grado_academico ?? '', [Validators.required]],
    });
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

  public getValue(controlName: string): any {
    return this.form.get(controlName)?.value;
  }

  public getError(controlName: string): string | null {
    const control = this.form.get(controlName);
    if (control && (control.touched || control.dirty || this.submitted)) {
      if (control.hasError('required')) return this.errorsService.required;
      if (control.hasError('email')) return this.errorsService.email;
      if (control.hasError('maxlength')) return this.errorsService.max;
      if (control.hasError('minlength')) return this.errorsService.min;
      if (control.hasError('min')) return 'La edad debe ser mayor o igual a 18';
      if (control.hasError('pattern')) return this.errorsService.pattern;
    }

    return this.errors[controlName] ?? null;
  }

  public registrar(){
    // Valida primero el formulario reactivo y luego conserva la validación de servicio para no romper el backend.
    this.submitted = true;
    this.errors = {};
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const payload = { ...this.form.getRawValue() };

    // Inicializo el objeto de errores para evitar que se muestren errores anteriores o datos anteriores al momento de registrar un nuevo admin
    this.errors = {};
    console.log("Datos del admin: ", payload);

    // Validar datos y mostrar errores
    this.errors = this.administradoresService.validarAdmin(payload, this.editar);
    //Verificamos si el objeto de errores está vacío, lo que indica que no hay errores de validación
    if(Object.keys(this.errors).length > 0){
      return;
    }

    // Validar si las contraseñas coinciden solo si no se está editando, ya que en la edición no es obligatorio cambiar la contraseña
    if(payload.password === payload.confirmar_password){
      // Si no hay errores de validación, procedemos a registrar al admin
      this.administradoresService.registrarAdmin(payload).subscribe({
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
      this.form.patchValue({ password: '', confirmar_password: '' });
    }



  }

  public actualizar(){
    // Validación de los datos
    this.submitted = true;
    this.errors = {};
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const payload = { ...this.form.getRawValue() };
    this.errors = this.administradoresService.validarAdmin(payload, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }
    // Llamamos a la función para actualizar al administrador, esta función se encuentra en el servicio de administradores
    this.administradoresService.actualizarAdmin(payload).subscribe({
      next: (response) => {
        this.notificationService.success("Administrador actualizado exitosamente");
        console.log(response);
        //Si se actualiza correctamente, redirigimos al login
        this.router.navigate(['/administrador']);
      },
      error: (error) => {
        console.error("Error al actualizar administrador: ", error);
        this.notificationService.error("Error al actualizar administrador");
      }
    });
  }

}