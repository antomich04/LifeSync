import { Routes } from '@angular/router';
import { HomePage } from './pages/home-page/home-page';
import { DashboardPage } from './pages/dashboard-page/dashboard-page';
import { ForecastPage } from './pages/forecast-page/forecast-page';
import { AdvisorsPage } from './pages/advisors-page/advisors-page';
import { SupportPage } from './pages/support-page/support-page';

export const routes: Routes = [
    {
        path: "",
        component: HomePage
    },
    {
        path: "dashboard",
        component: DashboardPage
    },
    {
        path: "forecast",
        component: ForecastPage
    },
    {
        path: "advisors",
        component: AdvisorsPage
    },
    {
        path: "support",
        component: SupportPage
    }

    // {
    //     path: "**",
    //     component: NotFoundPage
    // }
];
