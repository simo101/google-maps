import { shallow } from "enzyme";
import { GoogleMapLoader, GoogleMapProps, LatLng } from "google-map-react";
import GoogleMap from "google-map-react";
import { DOM, createElement } from "react";

import { Map, MapProps } from "../Map";
import { MapMarker } from "../MapMarker";

import { EventMock, GeocoderLocationType, GeocoderMock, GeocoderStatus, LatLngBoundsMock,
    LatLngMock, MapsMock, MarkerMock } from "../../../../../../../tests/mocks/GoogleMaps";

import { MxUiMock } from "../../../../../../../tests/mocks/Mendix";

describe("Map", () => {
    const address = "Lumumba Ave, Kampala, Uganda";
    const APIKey = "AIzaSyACjBNesZXeRFx86N7RMCWiTQP5GT_jDec";
    const renderMap = (props: MapProps) => shallow(createElement(Map, props));
    const defaultCenterLocation = { lat: 51.9107963, lng: 4.4789878 };
    const successMockLocation = { lat: 30, lng: 118 };
    const multipleAddressMockLocation = { lat: 34.213171, lng: -118.571022 };

    beforeAll(() => {
        window.google = window.google || {};
        window.google.maps = window.google.maps || {};
        window.google.event = window.google.event || {};
        window.google.maps.Geocoder = GeocoderMock;
        window.google.maps.Map = MapsMock;
        window.google.maps.LatLngBounds = LatLngBoundsMock;
        window.google.maps.LatLng = LatLngMock;
        window.google.maps.Marker = MarkerMock;
        window.google.maps.event = EventMock;
        window.google.maps.GeocoderStatus = GeocoderStatus;
        window.google.maps.GeocoderLocationType = GeocoderLocationType;
        window.mx = window.mx || {};
        window.mx.ui = MxUiMock.prototype;
    });

    describe("when online", () => {
        it("should render with the map structure", () => {
            const map = renderMap({ address });
            expect(map).toBeElement(
                DOM.div({ className: "mx-google-maps" },
                    createElement(GoogleMap, {
                        bootstrapURLKeys: { key: undefined },
                        center: defaultCenterLocation,
                        defaultZoom: 14,
                        onGoogleApiLoaded: jasmine.any(Function) as any,
                        resetBoundsOnResize: true
                    },
                        createElement(MapMarker, {
                            lat: defaultCenterLocation.lat,
                            lng: defaultCenterLocation.lng
                        })
                    )
                )
            );
        });

        xit("renders with classes", () => {
            const googleMap = renderMap({ address }).first();

            expect(googleMap.prop("containerElement").props.className).toBe("mx-google-map-container");
            expect(googleMap.prop("loadingElement").props.className).toBe("mx-google-maps-loading");
            expect(googleMap.prop("mapElement").props.className).toBe("mx-google-maps");
        });

        xit("should add a resize listener", () => {
            spyOn(window.google.maps.event, "addDomListener");
            const mapDocument = renderMap({ address });
            const googleMap: any = mapDocument.first();

            googleMap.props().onMapLoad();

            expect(window.google.maps.event.addDomListener).toHaveBeenCalled();
        });

        xit("should center the map on resize", () => {
            spyOn(window.google.maps.event, "trigger");
            spyOn(window.google.maps.Map.prototype, "setCenter");

            const map = renderMap({ address });
            map.setState({ isLoaded: true });
            window.google.maps.event.trigger(window, "resize");

            expect(window.google.maps.event.trigger).toHaveBeenCalled();
            expect(window.google.maps.Map.prototype.setCenter).toHaveBeenCalled();
        });

        xit("should remove the resize listener", () => {
            spyOn(window.google.maps.event, "clearListeners");

            const map = renderMap({ address }).instance() as Map;
            // map.componentWillUnmount();

            expect(window.google.maps.event.clearListeners).toHaveBeenCalled();
        });

        describe("with no address", () => {
            xit("should not look up the location", () => {
                spyOn(window.google.maps.Geocoder.prototype, "geocode").and.callThrough();
                const output = renderMap({ address: "" });
                const map = output.instance() as Map;

                map.componentWillReceiveProps({ address: undefined });

                expect(window.google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
            });

            xit("should not display a marker", () => {
                spyOn(window.google.maps, "Marker");
                const output = renderMap({ address: "" });
                const map = output.instance() as Map;

                map.componentWillReceiveProps({ address: undefined });

                expect(window.google.maps.Marker).not.toHaveBeenCalled();
            });

            xit("should center to the default address", () => {
                const googleMap = renderMap({ address }).first();

                expect(googleMap.prop("center").lat).toBe(defaultCenterLocation.lat);
                expect(googleMap.prop("center").lng).toBe(defaultCenterLocation.lng);
            });
        });

        describe("with a valid address", () => {
            xit("should lookup the location", () => {
                spyOn(window.google.maps.Geocoder.prototype, "geocode");
                const output = renderMap({ address: "" });
                const map = output.instance() as Map;

                map.componentWillReceiveProps({ address });

                expect(window.google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
            });

            xit("should render a marker", () => {
                spyOn(window.google.maps, "Marker");
                let mapDocument = renderMap({ address });
                const googleMap: any = mapDocument.first();

                googleMap.props().onMapLoad();

                // expect(googleMap.props().marker).not.toBe(null);
                expect(window.google.maps.Marker).not.toHaveBeenCalled();
            });

            xit("should center to the location of the address", () => {
                spyOn(window.google.maps, "Marker");
                spyOn(window.google.maps.Geocoder.prototype, "geocode").and.callThrough();
                const mapDocument = renderMap({ address });
                const mapComponent = mapDocument.instance() as Map;

                const googleMap: any = mapDocument.first();
                googleMap.props().onMapLoad();

                expect(mapComponent.state.location.lat).toBe(successMockLocation.lat);
                expect(mapComponent.state.location.lng).toBe(successMockLocation.lng);
                // expect(googleMap.props().marker).not.toBe(null);
                expect(window.google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
            });

            xit("should display the first marker if multiple locations are found", () => {
                spyOn(window.google.maps.Geocoder.prototype, "geocode").and.callThrough();
                const mapDocument = renderMap({ address: "multipleAddress" });
                const mapComponent = mapDocument.instance() as Map;

                const googleMap: any = mapDocument.first();
                googleMap.props().onMapLoad();

                expect(mapComponent.state.location.lat).toBe(multipleAddressMockLocation.lat);
                expect(mapComponent.state.location.lng).toBe(multipleAddressMockLocation.lng);
                // expect(googleMap.props().marker).not.toBe(null);
                expect(window.google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
            });
        });

        describe("with an invalid address", () => {
            xit("should fail to find a location", () => {
                spyOn(window.google.maps.Geocoder.prototype, "geocode").and.callThrough();
                const output = renderMap({ address });
                const map = output.instance() as Map;

                map.componentWillReceiveProps({ address: "" });

                expect(window.google.maps.Geocoder.prototype.geocode).toHaveBeenCalled();
            });

            xit("should not render a marker", () => {
                const googleMap = renderMap({ address: "" }).first();

                expect(googleMap.prop("marker")).toBe(null);
            });

            xit("should center to the default address", () => {
                const googleMap = renderMap({ address: "" }).first();

                expect(googleMap.prop("center").lat).toBe(defaultCenterLocation.lat);
                expect(googleMap.prop("center").lng).toBe(defaultCenterLocation.lng);
            });

            xit("should display an error", () => {
                spyOn(window.mx.ui, "error").and.callThrough();
                const invalidAddress = "";
                const output = renderMap({ address });
                const map = output.instance() as Map;

                map.componentWillReceiveProps({ address: invalidAddress });

                expect(window.mx.ui.error).toHaveBeenCalled();
            });
        });

        afterAll(() => {
            // Probably its good enough the reset fully.
            // window.google = undefined;
            window.google.maps.Map = MapsMock;
            window.google.maps.Geocoder = GeocoderMock;
            window.google.maps.LatLngBounds = LatLngBoundsMock;
            window.google.maps.LatLng = LatLngMock;
            window.google.maps.Marker = MarkerMock;
            window.google.maps.event = EventMock;
        });
    });

    describe("on loading", () => {
        xit("should load the google maps script without API key", () => {
            window.google.maps.Map = undefined;
            const output = renderMap({ address: undefined });
            const map = output.instance() as Map;

            map.componentWillReceiveProps({ address });

            expect(document.body.innerHTML).not.toContain(APIKey);
            expect(google).toBeDefined();
        });

        xit("should load the google maps script with API key", () => {
            window.google.maps.Map = undefined;
            const googleMap = renderMap({ address, apiKey: APIKey }).first();

            expect(googleMap.prop("googleMapURL")).toContain(APIKey);
            expect(google).toBeDefined();
        });
    });

});
