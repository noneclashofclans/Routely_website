class intelligentPrices {
    static cityBaseRates = {
        uber: {
            bike: { base: 10, perKm: 4, perMin: 0.3, minFare: 15 },
            auto: { base: 20, perKm: 7, perMin: 0.5, minFare: 30 },
            mini: { base: 25, perKm: 9, perMin: 0.8, minFare: 45 },
            sedan: { base: 35, perKm: 11, perMin: 1.0, minFare: 65 },
            suv: { base: 50, perKm: 14, perMin: 1.3, minFare: 90 }
        },
        ola: {
            bike: { base: 12, perKm: 3.5, perMin: 0.25, minFare: 18 },
            auto: { base: 22, perKm: 6.5, perMin: 0.45, minFare: 32 },
            mini: { base: 28, perKm: 8.5, perMin: 0.75, minFare: 48 },
            sedan: { base: 38, perKm: 10.5, perMin: 0.95, minFare: 68 },
            suv: { base: 52, perKm: 13.5, perMin: 1.25, minFare: 95 }
        },
        rapido: {
            bike: { base: 8, perKm: 3, perMin: 0.2, minFare: 12 },
            auto: { base: 18, perKm: 6, perMin: 0.4, minFare: 28 },
            mini: { base: 22, perKm: 8, perMin: 0.7, minFare: 42 },
            sedan: { base: 32, perKm: 10, perMin: 0.9, minFare: 60 },
            suv: { base: 45, perKm: 13, perMin: 1.2, minFare: 85 }
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
                timing: this.getCurrentTimingInfo(),
                source: 'intelligent_estimation'
            };

        }
        catch (error) {
            console.error("Pricing error: ", error);
            throw new Error('Could not calculate prices.');
        }
    }

    static calculateIntelligentPrice(service, vehicleType, routeInfo) {
        const rates = this.cityBaseRates[service][vehicleType];
        const timing = this.getCurrentTimingInfo();

        const distanceCost = routeInfo.distance * rates.perKm;
        const timeCost = routeInfo.trafficDuration * rates.perMin;
        let baseFare = rates.base + distanceCost + timeCost;

        const surge = this.calculateIntelligentSurge(timing, routeInfo, service, vehicleType);
        const surgedPrice = baseFare * surge;

        const finalPrice = Math.max(surgedPrice, rates.minFare);

        const serviceAdjustment = this.getServiceAdjustment(service, vehicleType);
        const adjustedPrice = finalPrice * serviceAdjustment;

        const roundedPrice = Math.round(adjustedPrice / 5) * 5;

        return {
            price: roundedPrice,
            duration: Math.round(routeInfo.trafficDuration),
            distance: routeInfo.distance,
            surge: parseFloat(surge.toFixed(1)),
            currency: 'INR',
            timing: timing.period,
            breakdown: {
                base: rates.base,
                distance: Math.round(distanceCost),
                time: Math.round(timeCost),
                surge: surge,
                serviceAdjustment: serviceAdjustment
            }
        };
    }

    static calculateIntelligentSurge(timing, routeInfo, service, vehicleType) {
        let surge = 1.0;
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();

        if (hour >= 0 && hour < 6) {
            surge *= 0.95;
        }
        else if (hour >= 7 && hour < 10) {
            surge *= 1.2;
            if (vehicleType === 'auto' || vehicleType === 'bike') {
                surge *= 1.1;
            }
        }
        else if (hour >= 12 && hour < 14) {
            surge *= 1.05;
        }
        else if (hour >= 17 && hour < 21) {
            surge *= 1.3;
            if (vehicleType === 'suv' || vehicleType === 'sedan') {
                surge *= 1.15;
            }
        }
        else if (hour >= 22 && hour < 24) {
            surge *= 1.1;
        }

        if (day === 0 || day === 6) {
            surge *= 1.15;
            if (vehicleType === 'suv' || vehicleType === 'sedan') {
                surge *= 1.1;
            }
        }

        if (routeInfo.distance > 15) {
            surge *= 0.95;
        } else if (routeInfo.distance < 3) {
            surge *= 1.1;
        }

        const trafficMultiplier = routeInfo.trafficDuration / (routeInfo.distance * 3 + 0.1);
        if (trafficMultiplier > 1.8) {
            surge *= 1.2;
        } else if (trafficMultiplier > 1.3) {
            surge *= 1.1;
        }

        if (service === 'uber') {
            surge *= 1.03;
        } else if (service === 'rapido') {
            surge *= 0.93;
        }

        return Math.max(0.8, Math.min(surge, 2.5));
    }

    static getServiceAdjustment(service, vehicleType) {
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
                suv: 1.1
            },
            rapido: {
                bike: 0.92,
                auto: 0.94,
                mini: 0.96,
                sedan: 0.98,
                suv: 1.0
            }
        };

        return adjustments[service]?.[vehicleType] || 1.0;
    }

    static getCurrentTimingInfo() {
        const now = new Date();
        const hour = now.getHours();
        const day = now.getDay();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        let period, description;

        if (hour >= 0 && hour < 6) {
            period = 'late_night';
            description = 'Late Night (12AM-6AM)';
        } else if (hour >= 6 && hour < 9) {
            period = 'early_morning';
            description = 'Early Morning (6AM-9AM)';
        } else if (hour >= 9 && hour < 12) {
            period = 'morning';
            description = 'Morning (9AM-12PM)';
        } else if (hour >= 12 && hour < 14) {
            period = 'lunch';
            description = 'Lunch Time (12PM-2PM)';
        } else if (hour >= 14 && hour < 17) {
            period = 'afternoon';
            description = 'Afternoon (2PM-5PM)';
        } else if (hour >= 17 && hour < 21) {
            period = 'evening_peak';
            description = 'Evening Peak (5PM-9PM)';
        } else {
            period = 'night';
            description = 'Night (9PM-12AM)';
        }

        return {
            period,
            description,
            day: days[day],
            hour,
            isWeekend: day === 0 || day === 6,
            isPeak: period === 'evening_peak' || (hour >= 7 && hour < 10)
        };
    }

    static async getRouteInfo(startAddress, endAddress) {
        try {
            return this.estimateTier2CityRoute(startAddress, endAddress);
        } catch (error) {
            console.error('Route info error:', error);
            return this.estimateTier2CityRoute(startAddress, endAddress);
        }
    }


    static estimateTier2CityRoute(startAddress, endAddress) {
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

        let estimatedDistance;

        if (this.containsSameArea(startHint, endHint)) {
            estimatedDistance = 2 + seededRandom(0, 3);
        } else if (this.containsOppositeSides(startHint, endHint)) {
            estimatedDistance = 8 + seededRandom(0, 7);
        } else {
            estimatedDistance = 4 + seededRandom(0, 6);
        }

        const baseSpeed = 18 + seededRandom(0, 7);
        const baseDuration = (estimatedDistance / baseSpeed) * 60;

        const timing = this.getCurrentTimingInfo();
        let trafficMultiplier = 1.0;

        if (timing.isPeak) {
            trafficMultiplier = 1.5 + seededRandom(0, 0.5);
        } else if (timing.period === 'late_night') {
            trafficMultiplier = 0.7 + seededRandom(0, 0.3);
        }

        const trafficDuration = baseDuration * trafficMultiplier;

        return {
            distance: Math.round(estimatedDistance * 10) / 10,
            duration: Math.round(baseDuration),
            trafficDuration: Math.round(trafficDuration)
        };
    }

    static containsSameArea(start, end) {
        const commonTerms = ['same', 'near', 'close', 'adjacent', 'colony', 'sector', 'block'];
        return commonTerms.some(term => start.includes(term) || end.includes(term));
    }

    static containsOppositeSides(start, end) {
        const directions = ['east', 'west', 'north', 'south', 'central'];
        let startDir = directions.find(dir => start.includes(dir));
        let endDir = directions.find(dir => end.includes(dir));

        return startDir && endDir && startDir !== endDir;
    }
}

module.exports = intelligentPrices;