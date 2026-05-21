import { Component, OnInit, ViewChild } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/tools/notification-service';
import { AuthServices } from '../../services/auth-services';
import { DatosAlumno } from '../../interfaces/usuarios-interfaces';
import { AlumnoService } from '../../services/alumnos-service';

@Component({
  selector: 'app-alumnos-screen',
  imports: [...SHARED_IMPORTS],
  templateUrl: './alumnos-screen.html',
  styleUrl: './alumnos-screen.scss',
})
export class AlumnosScreen implements OnInit {
  public name_user: string = '';
  public rol: string = '';
  public lista_alumnos: any[] = [];

  //Declaramos las columnas que se mostrarán en la tabla
  public displayedColumns: string[] = [
    'id_alumno',
    'nombre',
    'email',
    'fecha_nacimiento',
    'telefono',
    'curp',
    'carrera',
    'editar',
    'eliminar',
  ];

  dataSource = new MatTableDataSource<DatosAlumno>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private authService: AuthServices,
    private alumnoService: AlumnoService,
    private notificationService: NotificationService,
    private router: Router,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.name_user = this.authService.getUserCompleteName();
    this.rol = this.authService.getUserGroup();
    this.obtenerAlumnos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  //Función para obtener la lista de alumnos registrados
  public obtenerAlumnos(): void {
    this.alumnoService.obtenerListaAlumnos().subscribe({
      next: (response) => {
        this.lista_alumnos = response;

        if (this.lista_alumnos.length > 0) {
          this.lista_alumnos.forEach((usuario) => {
            usuario.first_name = usuario.user.first_name;
            usuario.last_name = usuario.user.last_name;
            usuario.email = usuario.user.email;
          });
        }

        this.dataSource = new MatTableDataSource<DatosAlumno>(this.lista_alumnos as DatosAlumno[]);

        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
        }
      },
      error: () => {
        this.notificationService.error('No se pudo obtener la lista de alumnos');
      },
    });
  }

  public goEditar(idUser: number) {
    this.router.navigate(['/registro-usuarios', 'alumno', idUser]);
  }

  public delete(idUser: number) {}
}
