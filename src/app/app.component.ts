import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';
import { DatePipe } from '@angular/common';
import { catchError, map } from 'rxjs/operators';
import { Observable, throwError } from 'rxjs';
import { CurrentWeather } from './current-weather';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  // Task 1: Declare your variable here
  userInput: string = 'London';
  // Task 4: Declare your variables here
  $data!: Observable<CurrentWeather>;
  errorMessage: string = '';
  // Task 6: Declare your variables here
  backgroundImageUrl: string = '';
  // Task 7: Declare your variables here
  forecastDays: any;
  groupedForecasts: { [date: string]: any[] } = {};
  // Task 8: Declare your variables here
  timelineData: any = [];

  constructor(private http: HttpClient, private datePipe: DatePipe) {}
  ngOnInit() {
    this.searchWeather();
  }

  searchWeather() {
    // Task 3: Select API URL here
    // remove all spaces of input
    const sanitizedInput = this.userInput.replace(/\s+/g, '');

    // test ZIP pattern
    const zipCodePattern = /^\d{5}(?:-\d{4})?$/; // US ZIP code pattern 
    const isZipCode = zipCodePattern.test(this.userInput);

    //construct API query string based on the input
    let queryParam: string = isZipCode ? `zip` : `q`;
    let apiUrl = `https://api.openweathermap.org/data/2.5/weather?${queryParam}=${this.userInput}&units=metric&appid=${environment.key}`;


    // Task 4: Add your logic here
    this.errorMessage = '';
    this.$data = this.http.get(apiUrl).pipe(
      map((data: any) => {
        return {
          visibility: data.visibility,
          windSpeed: data.wind.speed,
          degTemp: data.main.temp,
          feelsLikeTemp: data.main.feels_like,
          name: data.name,
          dt: this.datePipe.transform(new Date(data.dt * 1000), 'medium'),
          description: data.weather[0].description,
          country: data.sys.country,
        };
      }),
      catchError((error) => {
        this.errorMessage = error.error.message;

       return throwError('An error occurred while fetching weather data.');
     
      })
    );
    // Task 6: Add your logic here
    this.backgroundImageUrl = '';

    this.$data.subscribe({
      next: (data: any) => {
        switch (true) {
          case data.description.includes('clear') || data.description.includes('sun'):
            this.backgroundImageUrl = 'assets/sunny.jpg';
            break;
          case data.description.includes('cloud'):
            this.backgroundImageUrl = 'assets/clouds.jpg';
            break;
          case data.description.includes('rain') || data.description.includes('drizzle'):
            this.backgroundImageUrl = 'assets/rain.jpg';
            break;
          case data.description.includes('haze'):
            this.backgroundImageUrl = 'assets/haze.jpg';
            break;
          case data.description.includes('fog'):
            this.backgroundImageUrl = 'assets/fog.jpg';
            break;
          case data.description.includes('snow'):
            this.backgroundImageUrl = 'assets/snow.jpg';
            break;
          default:
            this.backgroundImageUrl = 'assets/regularday.jpg';
        }
      },
    });
    // Task 8: Empty the date data here
    this.timelineData = [];
    this.forecastWeather();
  }

  forecastWeather() {
    // Task 7: Add your code here
    this.groupedForecasts = {}
    const forecastURL = `https://api.openweathermap.org/data/2.5/forecast?q=${this.userInput}&cnt=40&units=metric&appid=${environment.key}`;
    this.http.get(forecastURL).subscribe({
      next: (data: any) => {
        data.list.forEach((item: any) => {
          const date = new Date(item.dt * 1000).toDateString();
          if (!this.groupedForecasts[date]) {
            this.groupedForecasts[date] = [];
          }
          item.dt = this.datePipe.transform(new Date(item.dt * 1000), 'medium');
          this.groupedForecasts[date].push(item);
        });
        // convert grouped forecasts to an array to store the 5-days' dates
        this.forecastDays = Object.keys(this.groupedForecasts).map((date) => (date));
      },
    });
  }

  showTimeline(date: any) {
    // Task 8: Add your code here
    this.timelineData = this.groupedForecasts[date];
  }

}
