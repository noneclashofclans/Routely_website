class intelligentPrices {
    static cityBaseRates = {
        uber: {
            bike: { base: 25, perKm: 5, perMin: 0.5, minFare: 30 },
            auto: { base: 40, perKm: 8, perMin: 0.8, minFare: 50 },
            mini: { base: 60, perKm: 12, perMin: 1.2, minFare: 80 },
            sedan: { base: 80, perKm: 15, perMin: 1.5, minFare: 100 },
            suv: { base: 100, perKm: 18, perMin: 1.8, minFare: 120 }
        },
        ola: {
            bike: { base: 20, perKm: 4, perMin: 0.4, minFare: 25 },
            auto: { base: 35, perKm: 7, perMin: 0.7, minFare: 45 },
            mini: { base: 55, perKm: 11, perMin: 1.1, minFare: 70 },
            sedan: { base: 75, perKm: 14, perMin: 1.4, minFare: 90 },
            suv: { base: 95, perKm: 17, perMin: 1.7, minFare: 110 }
        },
        rapido: {
            bike: { base: 15, perKm: 3, perMin: 0.3, minFare: 20 },
            auto: { base: 30, perKm: 6, perMin: 0.6, minFare: 40 },
            mini: { base: 50, perKm: 10, perMin: 1.0, minFare: 65 },
            sedan: { base: 70, perKm: 13, perMin: 1.3, minFare: 85 },
            suv: { base: 90, perKm: 16, perMin: 1.6, minFare: 105 }
        }
    }

    static async intelligentEstimation(startPoint, endPoint) {
        try {
            const routeInfo = await this.getRouteInfo(startPoint, endPoint);

            const estimates = {
                uber: {},
                ola: {},
                rapido: {}
            };

            for (const service of ['uber', 'ola', 'rapido']) {
                if (this.cityBaseRates[service]) {
                    for (const [vehicleType, rates] of Object.entries(this.cityBaseRates[service])) {
                        const priceData = this.calculateIntelligentPrice(service, vehicleType, routeInfo);
                        estimates[service][vehicleType] = priceData;
                    }
                }
            }

            return {
                success: true,
                estimates,
                route: {
                    start: startPoint,
                    end: endPoint,
                    distance: routeInfo.distance,
                    duration: routeInfo.duration,
                    trafficDuration: routeInfo.trafficDuration
                },
                timing: this.getCurrentTimePeriod(),
                source: 'realistic_estimation'
            };

        } catch (error) {
            console.error("Pricing error: ", error);
            throw new Error('Could not calculate prices.');
        }
    }

    static calculateIntelligentPrice(service, vehicleType, routeInfo) {
        const rates = this.cityBaseRates[service][vehicleType];
        
        // Base calculation
        const distanceCost = routeInfo.distance * rates.perKm;
        const timeCost = routeInfo.trafficDuration * rates.perMin;
        let baseFare = rates.base + distanceCost + timeCost;

        // Dynamic pricing based on real factors
        const dynamicMultiplier = this.calculateDynamicMultiplier(service, vehicleType, routeInfo);
        const dynamicPrice = baseFare * dynamicMultiplier;

        const finalPrice = Math.max(dynamicPrice, rates.minFare);

        // Service-specific adjustments
        const serviceMultiplier = this.getServiceMultiplier(service, vehicleType);
        const adjustedPrice = finalPrice * serviceMultiplier;

        // Round to nearest 5 for realistic pricing
        const roundedPrice = Math.round(adjustedPrice / 5) * 5;

        return {
            price: roundedPrice,
            duration: Math.round(routeInfo.trafficDuration),
            distance: routeInfo.distance,
            surge: parseFloat(dynamicMultiplier.toFixed(1)),
            currency: 'INR'
        };
    }

    static calculateDynamicMultiplier(service, vehicleType, routeInfo) {
        const now = new Date();
        const hour = now.getHours();
        let multiplier = 1.0;

      
        if (hour >= 7 && hour < 10) {
            // Morning rush hour
            multiplier *= 1.4;
        } else if (hour >= 17 && hour < 21) {
            // Evening rush hour
            multiplier *= 1.6;
        } else if (hour >= 21 && hour < 23) {
            // Late evening
            multiplier *= 1.3;
        } else if (hour >= 23 || hour < 5) {
            // Late night
            multiplier *= 1.5;
        } else if (hour >= 12 && hour < 14) {
            // Lunch time
            multiplier *= 1.1;
        }

        // Distance-based adjustments
        if (routeInfo.distance < 2) {
            // Short trips have higher minimum costs
            multiplier *= 1.2;
        } else if (routeInfo.distance > 10) {
            // Longer trips get slight discount
            multiplier *= 0.9;
        }

        // Traffic-based pricing
        const speed = routeInfo.distance / (routeInfo.trafficDuration / 60); // km/h
        if (speed < 15) {
            // Heavy traffic
            multiplier *= 1.3;
        } else if (speed < 25) {
            // Moderate traffic
            multiplier *= 1.1;
        }

        // Vehicle type specific adjustments
        if (vehicleType === 'suv' || vehicleType === 'sedan') {
            // Premium vehicles have consistent pricing
            multiplier *= 1.1;
        } else if (vehicleType === 'bike') {
            // Bikes are more affordable
            multiplier *= 0.8;
        }

        // Service-specific strategies
        if (service === 'uber') {
            multiplier *= 1.05; // Uber typically charges premium
        } else if (service === 'rapido') {
            multiplier *= 0.9; // Rapido is usually more competitive
        }

        // Random fluctuation to simulate real-world pricing (±10%)
        const randomFactor = 0.9 + (Math.random() * 0.2);
        multiplier *= randomFactor;

        return Math.max(0.8, Math.min(multiplier, 3.0));
    }

    static getServiceMultiplier(service, vehicleType) {
        
        const adjustments = {
            uber: {
                bike: 1.0,
                auto: 1.02,
                mini: 1.05,
                sedan: 1.08,
                suv: 1.12
            },
            ola: {
                bike: 0.98,
                auto: 1.0,
                mini: 1.03,
                sedan: 1.06,
                suv: 1.10
            },
            rapido: {
                bike: 0.95,
                auto: 0.98,
                mini: 1.0,
                sedan: 1.03,
                suv: 1.06
            }
        };

        return adjustments[service]?.[vehicleType] || 1.0;
    }

    static getCurrentTimePeriod() {
        const now = new Date();
        const hour = now.getHours();
        
        let period = '';
        if (hour >= 5 && hour < 12) period = 'Morning';
        else if (hour >= 12 && hour < 17) period = 'Afternoon';
        else if (hour >= 17 && hour < 21) period = 'Evening';
        else period = 'Night';

        return {
            period: period,
            description: `${period} Hours`
        };
    }

    static async getRouteInfo(startAddress, endAddress) {
        try {
            return this.estimateRealisticRoute(startAddress, endAddress);
        } catch (error) {
            console.error('Route info error:', error);
            return this.estimateRealisticRoute(startAddress, endAddress);
        }
    }

    static estimateRealisticRoute(startAddress, endAddress) {
        const startHint = (startAddress || "").toLowerCase();
        const endHint = (endAddress || "").toLowerCase();

 
        const hashString = (str) => {
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash;
            }
            return Math.abs(hash);
        };

        const addresses = [startHint, endHint].sort();
        const seed = hashString(addresses.join('|'));

        const seededRandom = (min, max) => {
            const x = Math.sin(seed + min + max) * 10000;
            return min + ((x - Math.floor(x)) * (max - min));
        };

        // Realistic distance estimation
        let estimatedDistance;
        if (this.isShortTrip(startHint, endHint)) {
            estimatedDistance = 1.5 + seededRandom(0, 2);
        } else if (this.isMediumTrip(startHint, endHint)) {
            estimatedDistance = 4 + seededRandom(0, 3);
        } else {
            estimatedDistance = 8 + seededRandom(0, 6);
        }

        // Realistic speed estimation
        const now = new Date();
        const hour = now.getHours();
        let baseSpeed = 25; // km/h average

        if ((hour >= 7 && hour < 10) || (hour >= 17 && hour < 21)) {
            baseSpeed = 15; // Rush hour
        } else if (hour >= 22 || hour < 6) {
            baseSpeed = 35; // Late night, less traffic
        }

        const baseDuration = (estimatedDistance / baseSpeed) * 60;

        // Traffic multiplier
        let trafficMultiplier = 1.0;
        if (hour >= 7 && hour < 10) trafficMultiplier = 1.6;
        else if (hour >= 17 && hour < 21) trafficMultiplier = 1.8;
        else if (hour >= 12 && hour < 14) trafficMultiplier = 1.3;

        const trafficDuration = baseDuration * trafficMultiplier;

        return {
            distance: Math.round(estimatedDistance * 10) / 10,
            duration: Math.round(baseDuration),
            trafficDuration: Math.round(trafficDuration)
        };
    }

    static isShortTrip(start, end) {
        const shortTripIndicators = [
            'same', 'near', 'close', 'adjacent', 'next to', 'colony', 'sector'
        ];
        return shortTripIndicators.some(term => start.includes(term) || end.includes(term));
    }

    static isMediumTrip(start, end) {
        const mediumTripIndicators = [
            'market', 'mall', 'center', 'chowk', 'circle'
        ];
        return mediumTripIndicators.some(term => start.includes(term) || end.includes(term));
    }
}

module.exports = intelligentPrices;