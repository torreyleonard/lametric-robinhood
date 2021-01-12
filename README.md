![algotrader](https://github.com/torreyleonard/lametric-robinhood/blob/master/docs/display.gif?raw=true)
### *LaMetric app for displaying Robinhood data.*
Install for free on the [LaMetric app store.](https://apps.lametric.com/apps/robinhood/6436)

---

#### Links

- [LaMetric Time](https://lametric.com/en-US/time/overview)
- [Robinhood](https://robinhood.com)
- [Google Cloud](https://cloud.google.com)

---

This repository hosts all of the server-side code used by the LaMetric Time to gather data from Robinhood. The LaMetric Time polls the [Google Cloud Run](https://cloud.google.com/run) service every minute for the following data. These can be enabled or disabled within the LaMetric app:

- Portfolio percentage change
- Total portfolio value
- Portfolio graph
- Top moving stocks

---

#### Privacy Policy

The "LaMetric Robinhood app" (the App) is downloadable software that runs on a user’s LaMetric smart devices and uses Robinhood's unofficial Application Program Interface (API) Services. You can find out more about LaMetric smart devices at https://lametric.com.

The App is developed by Torrey Leonard and is available for free on the LaMetric app store. All of the software used by the app is open source and available in this GitHub repository. While running on a user's device, the App will request the user's Robinhood login credentials. These credentials are never stored and do not leave the scope of this project.
