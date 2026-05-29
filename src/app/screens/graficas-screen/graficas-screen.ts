import { Component, OnInit } from '@angular/core';
import { SHARED_IMPORTS } from '../../shared/shared.imports';
import DatalabelsPlugin from 'chartjs-plugin-datalabels';
import { AdministradoresService } from '../../services/administradores-service';
import { NotificationService } from '../../services/tools/notification-service';
import { TotalUsuarios } from '../../interfaces/graficas-interfaces';

@Component({
  selector: 'app-graficas-screen',
  imports: [
    ...SHARED_IMPORTS
  ],
  templateUrl: './graficas-screen.html',
  styleUrl: './graficas-screen.scss',
})
export class GraficasScreen implements OnInit{
  //Agregar chartjs-plugin-datalabelsx
  //Variables

  public total_user: TotalUsuarios = {
    total_admins: 0,
    total_maestros: 0,
    total_alumnos: 0
  };
  //Histograma
  lineChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de usuarios',
        backgroundColor: '#F88406'
      }
    ]
  }
  lineChartOption = {
    responsive:false
  }
  lineChartPlugins = [ DatalabelsPlugin ];

  //Barras
  barChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [] as number[],
        label: 'Eventos Académicos',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#82D3FB'
        ]
      }
    ]
  }
  barChartOption = {
    responsive:false
  }
  barChartPlugins = [ DatalabelsPlugin ];

  //Circular
  pieChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#FCFF44',
          '#F1C8F2',
          '#31E731'
        ]
      }
    ]
  }
  pieChartOption = {
    responsive:false
  }
  pieChartPlugins = [ DatalabelsPlugin ];

  // Doughnut
  doughnutChartData = {
    labels: ["Administradores", "Maestros", "Alumnos"],
    datasets: [
      {
        data: [] as number[],
        label: 'Registro de usuarios',
        backgroundColor: [
          '#F88406',
          '#FCFF44',
          '#31E7E7'
        ]
      }
    ]
  }
  doughnutChartOption = {
    responsive:false
  }
  doughnutChartPlugins = [ DatalabelsPlugin ];

  constructor(
    private notificationService: NotificationService,
    private administradoresServices: AdministradoresService
  ) { }

  ngOnInit(): void {
    this.obtenerTotalUsers();
  }

  // Función para obtener el total de usuarios registrados
  public obtenerTotalUsers() {
    this.administradoresServices.getTotalUsuarios().subscribe(
      (response) => {
        this.total_user = response;
        console.log("Total de usuarios: ", this.total_user);

        // Crear un arreglo con los datos obtenidos para cada rol 
        const datos: number[] = [
          this.total_user.total_admins,
          this.total_user.total_maestros,
          this.total_user.total_alumnos
        ];

        // Actualizar cada gráfica con datos reales
        // Actualizar solo el arreglo de datos del dataset, manteniendo el resto de la configuración
        this.lineChartData = {
          ...this.lineChartData,
          datasets: [{ ...this.lineChartData.datasets[0], data: datos }] 
        };

        this.barChartData = {
          ...this.barChartData,
          datasets: [{ ...this.barChartData.datasets[0], data: datos }]
        };

        this.pieChartData = {
          ...this.pieChartData,
          datasets: [{ ...this.pieChartData.datasets[0], data: datos }]
        };

        this.doughnutChartData = {
          ...this.doughnutChartData,
          datasets: [{ ...this.doughnutChartData.datasets[0], data: datos }]
        };

        this.notificationService.success("Total de usuarios registrados por cada rol obtenido correctamente");
      },
      (error) => {
        this.notificationService.error("No se pudo obtener el total de cada rol de usuarios");
      }
    );
  }
}