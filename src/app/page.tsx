'use client'
import Image from "next/image";
import Navbar from "./components/Navbar";
import { useQuery } from "react-query";
import axios from "axios";
import { format, fromUnixTime } from "date-fns";
import { parseISO } from "date-fns/parseISO";
import Container from "./components/Container";
import WeatherIcon from "./components/WeatherIcon";
import WeatherDetails from "./components/WeatherDetails";
import { metersToKilometers } from "./utils/metersToKilometers";
import { convertWindSpeed } from "./utils/convertWindSpeed";
import ForecastWeatherDetail from "./components/ForecastWeatherDetail";
import { useAtom } from "jotai";
import { placeAtom } from "./atom";
import { useEffect } from "react";

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

  const[place, setPlace]=useAtom(placeAtom)

    const { isLoading, error, data, refetch } = useQuery<WeatherData>('repoData', async () =>{
      const { data } = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${place}&appid=${process.env.NEXT_PUBLIC_WEATHER_KEY}&units=metric&cnt=56`
      );
      return data;
    }
    )

    useEffect(()=>{
      refetch()
    },[place, refetch]
    )

    const firstData=data?.list[0]

  if (isLoading) return (
    <div className="flex items-center min-h-screen justify-center">
      <p className="animate-bounce">Loading....</p>
    </div>
    )

  console.log('data: ', data)

  const uniqueDates = [
    ...new Set(
      data?.list.map(
        (entry) => new Date(entry.dt*1000).toISOString().split("T")[0]
      )
    )
  ];
    // Filtering data to get the first entry after 6 AM for each unique date
    const firstDataForEachDate = uniqueDates.map((date) => {
      return data?.list.find((entry) => {
        const entryDate = new Date(entry.dt * 1000).toISOString().split("T")[0];
        const entryTime = new Date(entry.dt * 1000).getHours();
        return entryDate === date && entryTime >= 6;
      });
    });

  return (
    <div className="flex flex-col gap-4 bg-gray-100 min-h-screen">
      <Navbar location={data?.city.name}/>
      <main className="px-3 max-w-7xl mx-auto flex flex-col gap-9 w-full pb-10 pt-4">
        {/*today data */}
        <section className="space-y-4">
          <div className="space-y-2">
          <h2 className="flex gap-1 text-2xl items-end">
            <p>{format(parseISO(firstData?.dt_txt??''), "EEEE")}</p>
            <p className="text-lg">({format(parseISO(firstData?.dt_txt??''), "dd.MM.yyyy")})</p>
          </h2>
          <Container className="gap-10 px-6 items-center">
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
                  {firstData?.main.temp_min.toFixed(0)}°↓{" "}
                </span>
                <span>
                  {" "}{firstData?.main.temp_max.toFixed(0)}°↑
                </span>
              </p>
              
            </div>
            {/*time and weather */}
              <div className="flex gap-10 sm:gap-16 overflow-x-scroll w-full justify-between pr-3">
                {data?.list.map((d, i) => (
                  <div key={i} className="flex flex-col justify-between gap-2 w-full items-center text-xs font-semibold">
                    <p className="whitespace-nowrap">
                      {format(parseISO(d.dt_txt), "HH:mm ")}
                    </p>
                    <WeatherIcon iconName={d.weather[0].icon} />
                    <p>{d?.main.temp.toFixed(0)}°</p>
                    <p><br /></p>
                  </div>
                ))}
              </div>
          </Container>
          </div>
          <div className="flex gap-4">
            <Container className="w-fit justify-center flex-col px-4 items-center">
              <p className="capitalize text-center">{firstData?.weather[0].description}</p>
              <WeatherIcon iconName={firstData?.weather[0].icon ?? ""} />
            </Container>
            <Container className="bg-yellow-300/80 px-6 gap-4 justify-between overflow-x-auto">
              <WeatherDetails visability={metersToKilometers(firstData?.visibility ?? 0)}
              airPressure={`${firstData?.main.pressure} hPa`}
              humidity={`${firstData?.main.humidity}%`}
              sunrise={format(data?.city.sunrise ?? 1702949452, "HH:mm")}
              sunset={format(data?.city.sunset ?? 1702517657, "HH:mm")}
              windSpeed={convertWindSpeed(firstData?.wind.speed ?? 1.64)}/>
            </Container>
          </div>

        </section>
        {/*7 day */}
        <section className="flex w-full flex-col gap-4">
          <p className="text-2xl">7 days forecast</p>         
          {firstDataForEachDate.map((d,i)=>(
            <ForecastWeatherDetail key={i} 
            description={d?.weather[0].description ?? ""}
                  weatehrIcon={d?.weather[0].icon ?? "01d"}
                  date={d ? format(parseISO(d.dt_txt), "dd.MM") : ""}
                  day={d ? format(parseISO(d.dt_txt), "dd.MM") : "EEEE"}
                  feels_like={d?.main.feels_like ?? 0}
                  temp={d?.main.temp ?? 0}
                  temp_max={d?.main.temp_max ?? 0}
                  temp_min={d?.main.temp_min ?? 0}
                  airPressure={`${d?.main.pressure} hPa `}
                  humidity={`${d?.main.humidity}% `}
                  sunrise={format(
                    fromUnixTime(data?.city.sunrise ?? 1702517657),
                    "H:mm"
                  )}
                  sunset={format(
                    fromUnixTime(data?.city.sunset ?? 1702517657),
                    "H:mm"
                  )}
                  visability={`${metersToKilometers(d?.visibility ?? 10000)} `}
                  windSpeed={`${convertWindSpeed(d?.wind.speed ?? 1.64)} `}/>
          ))} 
          
        </section>
      </main>
    </div>
  );
}
