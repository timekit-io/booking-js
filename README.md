# Booking.js by Timekit

[![Circle CI](https://img.shields.io/circleci/build/github/timekit-io/booking-js)](https://circleci.com/gh/timekit-io/booking-js)

[**Releases & changelog**](https://github.com/timekit-io/booking-js/releases)

> Make a beautiful embeddable booking widget in minutes running on the Timekit API.

![Booking.js Screenshot](misc/widget-screenshot.png)

⚠️ This is **version 2** of booking.js that supports the new projects model and uses App Widget Key for authentication. [Version 1 is still supported](https://github.com/timekit-io/booking-js/tree/master-v1).

## Documentation

All documentation, guides and examples can be found on [our developer portal](https://developers.timekit.io/v2/docs/booking-widget-v2).

*This repo is mainly for community contributions, and the curious soul that would like to customize the widget.*

## Roadmap/todos

See [Issues](https://github.com/timekit-io/booking-js/issues) for feature requests, bugs etc.

## License attributions

The `json-schema` v0.2.3 package is used pursuant to the BSD-3-Clause license


## How to publish changes to npm
make sure you upgrade version number in package.json file follow sementic versioning
- run ```yarn test``
- test manually to make sure widget works fine
- merge your changes to master and pull master branch locally
- make sure your changes are uptodate and clean
- run following commands

```
# login as tulipnpm user
yarn login

# commit and publish new changes
yarn publish
```

## Sponsor
![Scheduling API](https://user-images.githubusercontent.com/9488406/125080407-0dd25780-e0c5-11eb-9f70-ef958968674a.png)

This repo is sponsored by [**Spurwing**](https://www.spurwing.io/), where their API Makes Adding Scheduling Quick, Reliable and Scalable.
Use Spurwing to build and integrate Scheduling, Booking & Calendar features in your project. Read more about Spurwing [**Scheduling API on GitHub**](https://github.com/Spurwing/Appointment-Scheduling-API).
