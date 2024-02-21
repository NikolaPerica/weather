'use client'
import Image from "next/image";
import Navbar from "./components/Navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { format } from "date-fns";
import { parseISO } from "date-fns/parseISO";
import Container from "./components/Container";

//https://api.openweathermap.org/data/2.5/forecast?q=Split&appid=7f179e6b525bf3a607c6e4f39b5a0e94&units=metric&cnt=56

interface WeatherDetail {
  dt: number;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    sea_level: number;
    grnd_level: number;
    humidity: number;
    temp_kf: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  clouds: {
    all: number;
  };
  wind: {
    speed: number;
    deg: number;
    gust: number;
  };
  visibility: number;
  pop: number;
  sys: {
    pod: string;
  };
  dt_txt: string;
}

interface WeatherData {
  cod: string;
  message: number;
  cnt: number;
  list: WeatherDetail[];
  city: {
    id: number;
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
    country: string;
    population: number;
    timezone: number;
    sunrise: number;
    sunset: number;
  };
}


export default function Home() {
    const { isLoading, error, data } = useQuery<WeatherData>('repoData', async () =>{
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=Split&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&units=metric&cnt=56`
      );
      return data;
    }
    )

    const firstData=data?.list[0]

  if (isLoading) return (
    <div className="flex items-center min-h-screen justify-center">
      <p className="animate-bounce">Loading....</p>
    </div>
    )

  console.log('data: ', data)
  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar />
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/*today data */}
        <section>
          <h2 className="flex gap-1 text-2xl items-end">
            <p>{format(parseISO(firstData?.dt_txt??''), "EEEE")}</p>
            <p className="text-lg">({format(parseISO(firstData?.dt_txt??''), "dd.MM.yyyy")})</p>
          </h2>
          <Container className="gap-10 px6 items-center">
            <div className="flex flex-col px4">
              <span className="text-5xl">
                {firstData?.main.temp.toFixed(0)}°
              </span>
              <p className="text-xs space-x-1 whitespace-nowrap">
                <span>Feels like: </span>
                <span>{firstData?.main.feels_like}°</span>
              </p>
              <p className="text-xs space-x-2">
                <span>
                  {firstData?.main.temp_min}°↓{" "}
                </span>
                <span>
                  {" "}{firstData?.main.temp_max}°↑
                </span>
              </p>
              
            </div>
          </Container>

        </section>
        {/*7 day */}
        <section></section>
      </main>
    </div>
  );
}
