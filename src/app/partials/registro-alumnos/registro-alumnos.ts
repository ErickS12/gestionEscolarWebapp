import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { NgxMaskDirective } from 'ngx-mask';
import { AlumnoService } from '../../services/alumnos-service';
import { NotificationService } from '../../services/tools/notification-service';
import { ErrorsService } from '../../services/tools/errors-service';

@Component({
  selector: 'app-registro-alumnos',
  imports: [
    ...SHARED_IMPORTS,
    NgxMaskDirective
  ],
  templateUrl: './registro-alumnos.html',
  styleUrl: './registro-alumnos.scss',
})
export class RegistroAlumnos implements OnInit {
  @Input() rol:string = "";
  @Input() datos_user:any = {};

  public form!: FormGroup;
  public errors:any={};
  public inputType_1: string = 'password'; //inputs para cada entrada
  public inputType_2: string = 'password';
  public idUser: number = 0;
  public hide_1: boolean = false;
  public hide_2: boolean = false;
  public editar:boolean = false;
  public submitted:boolean = false;
  //public posgradoFlag:boolean = false;

public carrera: any[] = [
  { value: '1', viewValue: 'Ingeniería en Ciencias de la Computación' },
  { value: '2', viewValue: 'Ingeniería en Tecnologías de la Información' },
  { value: '3', viewValue: 'Licenciatura en Ciencias de la Computación' },
];

public posgrado: any[] = [
  { value: '1', viewValue: 'Maestría en Ciencias de la Computación' },
  { value: '2', viewValue: 'Doctorado en Ciencias de la Computación' },
];


 public materias:any[] = [
    {value: '1', nombre: 'Aplicaciones Web'},
    {value: '2', nombre: 'Programación 1'},
    {value: '3', nombre: 'Bases de datos'},
    {value: '4', nombre: 'Tecnologías Web'},
    {value: '5', nombre: 'Minería de datos'},
    {value: '6', nombre: 'Desarrollo móvil'},
    {value: '7', nombre: 'Estructuras de datos'},
    {value: '8', nombre: 'Administración de redes'},
    {value: '9', nombre: 'Ingeniería de Software'},
    {value: '10', nombre: 'Administración de S.O.'},
  ];

  public sexo: any[] = [
    { value: 'masculino', viewValue: 'Masculino' },
    { value: 'femenino', viewValue: 'Femenino' },
    { value: 'prefiero no decir', viewValue: 'Prefiero no decir' },
  ];

  public campus: any[] = [
    { value: '1', viewValue: 'CU San Manuel' },
    { value: '2', viewValue: 'CU2 Valsequillo' },
  ];

  public sueldoFocused: boolean = false;

constructor(
    private location: Location,
    private router: Router,
  private fb: FormBuilder,
    private alumnoService: AlumnoService,
    private notificationService: NotificationService,
  private activatedRoute: ActivatedRoute,
  private errorsService: ErrorsService
  ) { }

  ngOnInit(): void {
    //Primero validamos si existe un rol y un id, si es así, estamos en modo edición y cargamos los datos del usuario a editar
    if(this.activatedRoute.snapshot.params['id'] !== undefined){
      this.editar = true;
      //Asignamos a nuestra variable global el valor del ID que viene por la URL
      this.idUser = this.activatedRoute.snapshot.params['id'];
      //Asignamos los datos del usuario que vienen desde la vista principal con el decorador
      this.form = this.buildForm(this.datos_user);
    }else{
      // Si no va a editar, entonces inicializamos el JSON para registro nuevo
      const alumno = this.alumnoService.esquemaAlumno();
      alumno.rol = this.rol;
      this.form = this.buildForm(alumno);
  }  
  }

  private buildForm(alumno: any): FormGroup {
    const fechaNacimiento = this.toDateValue(alumno?.fecha_nacimiento);

    // El formulario reactivo controla la UI; la validación de service se mantiene para no cambiar el contrato del backend.
    return this.fb.group({
      rol: [alumno?.rol ?? this.rol],
      id_alumno: [alumno?.id_alumno ?? '', [Validators.required]],
      first_name: [alumno?.first_name ?? '', [Validators.required]],
      last_name: [alumno?.last_name ?? '', [Validators.required]],
      email: [{ value: alumno?.email ?? '', disabled: this.editar }, [Validators.required, Validators.email, Validators.maxLength(40)]],
      password: [alumno?.password ?? '', this.editar ? [] : [Validators.required]],
      confirmar_password: [alumno?.confirmar_password ?? '', this.editar ? [] : [Validators.required]],
      fecha_nacimiento: [fechaNacimiento, [Validators.required]],
      telefono: [alumno?.telefono ?? '', [Validators.required]],
      curp: [alumno?.curp ?? '', [Validators.required, Validators.minLength(18), Validators.maxLength(18)]],
      carrera: [alumno?.carrera ?? '', [Validators.required]],
      direccion: [alumno?.direccion ?? '', [Validators.required]],
      sexo: [alumno?.sexo ?? '', [Validators.required]],
      materias_json: [Array.isArray(alumno?.materias_json) ? alumno.materias_json : [], [Validators.required]],
    });
  }

  private toDateValue(value: unknown): string | Date {
    if (value instanceof Date) {
      return value;
    }

    if (typeof value === 'string') {
      const normalized = value.trim();
      if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
        return new Date(`${normalized}T00:00:00`);
      }
      return normalized;
    }

    return '';
  }

  private normalizeFechaNacimiento(value: unknown): string {
    if (value instanceof Date && !Number.isNaN(value.getTime())) {
      return value.toISOString().split('T')[0];
    }

    if (typeof value === 'string') {
      const rawFecha = value.trim();
      const parts = rawFecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);

      if (parts) {
        const day = parts[1].padStart(2, '0');
        const month = parts[2].padStart(2, '0');
        const year = parts[3];
        return `${year}-${month}-${day}`;
      }

      return rawFecha;
    }

    return '';
  }



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

  public revisarSeleccion(nombre: string){
    const materias = this.form.get('materias_json')?.value ?? [];

    if(Array.isArray(materias)){
      const busqueda = materias.find((element: string)=>element===nombre);
      if(busqueda !== undefined){
        return true;
      }else{
        return false;
      }
    }else{
      return false;
    }
  }

  //Función para detectar el cambio de fecha
  public changeFecha(event :any){
    this.form.patchValue({ fecha_nacimiento: event.value });
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
      if (control.hasError('min')) return this.errorsService.numeric;
      if (control.hasError('pattern')) return this.errorsService.pattern;
    }

    return this.errors[controlName] ?? null;
  }

  public registrar(){
    // Inicializo la validación reactiva y luego mantengo la validación de service para no cambiar el backend.
    this.submitted = true;
    this.errors = {};
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const payload = { ...this.form.getRawValue(), fecha_nacimiento: this.normalizeFechaNacimiento(this.form.getRawValue().fecha_nacimiento) };
    console.log("Datos del alumno: ", payload);

    // Validar datos y mostrar errores
    this.errors = this.alumnoService.validarAlumno(payload, this.editar);
    //Verificamos si el objeto de errores está vacío, lo que indica que no hay errores de validación
    if(Object.keys(this.errors).length > 0){
      return;
    }

    // Validar si las contraseñas coinciden solo si no se está editando, ya que en la edición no es obligatorio cambiar la contraseña
    if(payload.password === payload.confirmar_password){
      // TODO: Aquí iría la lógica para registrar al alumno, como llamar a un servicio que se encargue de hacer la petición al backend
      //El this.alumno se refiere al objeto que contiene los datos del alumno que se van a enviar al backend para registrar un nuevo alumno. Este objeto se llena con los datos que el usuario ingresa en el formulario de registro, y puede tener propiedades como first_name, last_name, email, password, confirmar_password, fecha_nacimiento, telefono, curp, carrera y materias_json, dependiendo de los campos que tenga el formulario. El servicio de alumnos se encargará de tomar este objeto y enviarlo al backend para que se procese el registro del nuevo alumno.
      this.alumnoService.registrarAlumno(payload).subscribe({
        next: (response) => {
          this.notificationService.success("Alumno registrado exitosamente");
          console.log(response);
          //Si se registra correctamente, redirigimos al login
          this.router.navigate(['']);
        },
        error: (error) => {
          console.error("Error al registrar alumno: ", error);
          this.notificationService.error("Error al registrar alumno");
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

    const payload = { ...this.form.getRawValue(), fecha_nacimiento: this.normalizeFechaNacimiento(this.form.getRawValue().fecha_nacimiento) };
    this.errors = this.alumnoService.validarAlumno(payload, this.editar);
    if(Object.keys(this.errors).length > 0){
      return;
    }
    // Llamamos a la función para actualizar al alumno, esta función se encuentra en el servicio de alumnos
    this.alumnoService.actualizarAlumno(payload).subscribe({
      next: (response) => {
        this.notificationService.success("Alumno actualizado exitosamente");
        console.log(response);
        //Si se actualiza correctamente, redirigimos al login
        this.router.navigate(['/alumnos']);
      },
      error: (error) => {
        console.error("Error al actualizar alumno: ", error);
        this.notificationService.error("Error al actualizar alumno");
      }
    });



  }


  public checkboxChange(event:any){
    const materias = Array.isArray(this.form.get('materias_json')?.value) ? [...this.form.get('materias_json')?.value] : [];

    if(event.checked){
      if (!materias.includes(event.source.value)) {
        materias.push(event.source.value);
      }
    }else{
      const index = materias.indexOf(event.source.value);
      if (index >= 0) {
        materias.splice(index, 1);
      }
    }

    this.form.patchValue({ materias_json: materias });
  }

  // Función para los campos solo de datos alfabeticos
  public soloLetras(event: KeyboardEvent) {
    const charCode = event.key.charCodeAt(0);
    // Permitir solo letras (mayúsculas y minúsculas) y espacio
    if (
      !(charCode >= 65 && charCode <= 90) &&  // Letras mayúsculas
      !(charCode >= 97 && charCode <= 122) && // Letras minúsculas
      charCode !== 32                         // Espacio
    ) {
      event.preventDefault();
    }
  }
}

