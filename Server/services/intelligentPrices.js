// class intelligentPrices {
//     static cityBaseRates = {
//         uber: {
//             bike: { base: 10, perKm: 4, perMin: 0.3, minFare: 15 },
//             auto: { base: 20, perKm: 7, perMin: 0.5, minFare: 30 },
//             mini: { base: 25, perKm: 9, perMin: 0.8, minFare: 45 },
//             sedan: { base: 35, perKm: 11, perMin: 1.0, minFare: 65 },
//             suv: { base: 50, perKm: 14, perMin: 1.3, minFare: 90 }
//         },
//         ola: {
//             bike: { base: 12, perKm: 3.5, perMin: 0.25, minFare: 18 },
//             auto: { base: 22, perKm: 6.5, perMin: 0.45, minFare: 32 },
//             mini: { base: 28, perKm: 8.5, perMin: 0.75, minFare: 48 },
//             sedan: { base: 38, perKm: 10.5, perMin: 0.95, minFare: 68 },
//             suv: { base: 52, perKm: 13.5, perMin: 1.25, minFare: 95 }
//         },
//         rapido: {
//             bike: { base: 8, perKm: 3, perMin: 0.2, minFare: 12 },
//             auto: { base: 18, perKm: 6, perMin: 0.4, minFare: 28 },
//             mini: { base: 22, perKm: 8, perMin: 0.7, minFare: 42 },
//             sedan: { base: 32, perKm: 10, perMin: 0.9, minFare: 60 },
//             suv: { base: 45, perKm: 13, perMin: 1.2, minFare: 85 }
//         }
//     }

//     static async intelligentEstimation(startPoint, endPoint) {
//         try {
//             const routeInfo = await this.getRouteInfo(startPoint, endPoint);

//             const estimates = {
//                 uber: {},
//                 ola: {},
//                 rapido: {}
//             };

//             for (const service of ['uber', 'ola', 'rapido']) {
//                 if (this.cityBaseRates[service]) {
//                     for (const [vehicleType, rates] of Object.entries(this.cityBaseRates[service])) {
//                         const priceData = this.calculateIntelligentPrice(service, vehicleType, routeInfo);
//                         estimates[service][vehicleType] = priceData;
//                     }
//                 }
//             }
//             return {
//                 success: true,
//                 estimates,
//                 route: {
//                     start: startPoint,
//                     end: endPoint,
//                     distance: routeInfo.distance,
//                     duration: routeInfo.duration,
//                     trafficDuration: routeInfo.trafficDuration
//                 },
//                 timing: this.getCurrentTimingInfo(),
//                 source: 'intelligent_estimation'
//             };

//         }
//         catch (error) {
//             console.error("Pricing error: ", error);
//             throw new Error('Could not calculate prices.');
//         }
//     }

//     static calculateIntelligentPrice(service, vehicleType, routeInfo) {
//         const rates = this.cityBaseRates[service][vehicleType];
//         const timing = this.getCurrentTimingInfo();

//         const distanceCost = routeInfo.distance * rates.perKm;
//         const timeCost = routeInfo.trafficDuration * rates.perMin;
//         let baseFare = rates.base + distanceCost + timeCost;

//         const surge = this.calculateIntelligentSurge(timing, routeInfo, service, vehicleType);
//         const surgedPrice = baseFare * surge;

//         const finalPrice = Math.max(surgedPrice, rates.minFare);

//         const serviceAdjustment = this.getServiceAdjustment(service, vehicleType);
//         const adjustedPrice = finalPrice * serviceAdjustment;

//         const roundedPrice = Math.round(adjustedPrice / 5) * 5;

//         return {
//             price: roundedPrice,
//             duration: Math.round(routeInfo.trafficDuration),
//             distance: routeInfo.distance,
//             surge: parseFloat(surge.toFixed(1)),
//             currency: 'INR',
//             timing: timing.period,
//             breakdown: {
//                 base: rates.base,
//                 distance: Math.round(distanceCost),
//                 time: Math.round(timeCost),
//                 surge: surge,
//                 serviceAdjustment: serviceAdjustment
//             }
//         };
//     }

//     static calculateIntelligentSurge(timing, routeInfo, service, vehicleType) {
//         let surge = 1.0;
//         const now = new Date();
//         const hour = now.getHours();
//         const day = now.getDay();

//         if (hour >= 0 && hour < 6) {
//             surge *= 0.95;
//         }
//         else if (hour >= 7 && hour < 10) {
//             surge *= 1.2;
//             if (vehicleType === 'auto' || vehicleType === 'bike') {
//                 surge *= 1.1;
//             }
//         }
//         else if (hour >= 12 && hour < 14) {
//             surge *= 1.05;
//         }
//         else if (hour >= 17 && hour < 21) {
//             surge *= 1.3;
//             if (vehicleType === 'suv' || vehicleType === 'sedan') {
//                 surge *= 1.15;
//             }
//         }
//         else if (hour >= 22 && hour < 24) {
//             surge *= 1.1;
//         }

//         if (day === 0 || day === 6) {
//             surge *= 1.15;
//             if (vehicleType === 'suv' || vehicleType === 'sedan') {
//                 surge *= 1.1;
//             }
//         }

//         if (routeInfo.distance > 15) {
//             surge *= 0.95;
//         } else if (routeInfo.distance < 3) {
//             surge *= 1.1;
//         }

//         const trafficMultiplier = routeInfo.trafficDuration / (routeInfo.distance * 3 + 0.1);
//         if (trafficMultiplier > 1.8) {
//             surge *= 1.2;
//         } else if (trafficMultiplier > 1.3) {
//             surge *= 1.1;
//         }

//         if (service === 'uber') {
//             surge *= 1.03;
//         } else if (service === 'rapido') {
//             surge *= 0.93;
//         }

//         return Math.max(0.8, Math.min(surge, 2.5));
//     }

//     static getServiceAdjustment(service, vehicleType) {
//         const adjustments = {
//             uber: {
//                 bike: 1.0,
//                 auto: 1.02,
//                 mini: 1.05,
//                 sedan: 1.08,
//                 suv: 1.12
//             },
//             ola: {
//                 bike: 0.98,
//                 auto: 1.0,
//                 mini: 1.03,
//                 sedan: 1.06,
//                 suv: 1.1
//             },
//             rapido: {
//                 bike: 0.92,
//                 auto: 0.94,
//                 mini: 0.96,
//                 sedan: 0.98,
//                 suv: 1.0
//             }
//         };

//         return adjustments[service]?.[vehicleType] || 1.0;
//     }

//     static getCurrentTimingInfo() {
//         const now = new Date();
//         const hour = now.getHours();
//         const day = now.getDay();
//         const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

//         let period, description;

//         if (hour >= 0 && hour < 6) {
//             period = 'late_night';
//             description = 'Late Night (12AM-6AM)';
//         } else if (hour >= 6 && hour < 9) {
//             period = 'early_morning';
//             description = 'Early Morning (6AM-9AM)';
//         } else if (hour >= 9 && hour < 12) {
//             period = 'morning';
//             description = 'Morning (9AM-12PM)';
//         } else if (hour >= 12 && hour < 14) {
//             period = 'lunch';
//             description = 'Lunch Time (12PM-2PM)';
//         } else if (hour >= 14 && hour < 17) {
//             period = 'afternoon';
//             description = 'Afternoon (2PM-5PM)';
//         } else if (hour >= 17 && hour < 21) {
//             period = 'evening_peak';
//             description = 'Evening Peak (5PM-9PM)';
//         } else {
//             period = 'night';
//             description = 'Night (9PM-12AM)';
//         }

//         return {
//             period,
//             description,
//             day: days[day],
//             hour,
//             isWeekend: day === 0 || day === 6,
//             isPeak: period === 'evening_peak' || (hour >= 7 && hour < 10)
//         };
//     }

//     static async getRouteInfo(startAddress, endAddress) {
//         try {
//             return this.estimateTier2CityRoute(startAddress, endAddress);
//         } catch (error) {
//             console.error('Route info error:', error);
//             return this.estimateTier2CityRoute(startAddress, endAddress);
//         }
//     }


//     static estimateTier2CityRoute(startAddress, endAddress) {
//         const startHint = (startAddress || "").toLowerCase();
//         const endHint = (endAddress || "").toLowerCase();

        
//         const hashString = (str) => {
//             let hash = 0;
//             for (let i = 0; i < str.length; i++) {
//                 const char = str.charCodeAt(i);
//                 hash = ((hash << 5) - hash) + char;
//                 hash = hash & hash;
//             }
//             return Math.abs(hash);
//         };

       
//         const addresses = [startHint, endHint].sort();
//         const seed = hashString(addresses.join('|'));

        
//         const seededRandom = (min, max) => {
//             const x = Math.sin(seed + min + max) * 10000;
//             return min + ((x - Math.floor(x)) * (max - min));
//         };

//         let estimatedDistance;

//         if (this.containsSameArea(startHint, endHint)) {
//             estimatedDistance = 2 + seededRandom(0, 3);
//         } else if (this.containsOppositeSides(startHint, endHint)) {
//             estimatedDistance = 8 + seededRandom(0, 7);
//         } else {
//             estimatedDistance = 4 + seededRandom(0, 6);
//         }

//         const baseSpeed = 18 + seededRandom(0, 7);
//         const baseDuration = (estimatedDistance / baseSpeed) * 60;

//         const timing = this.getCurrentTimingInfo();
//         let trafficMultiplier = 1.0;

//         if (timing.isPeak) {
//             trafficMultiplier = 1.5 + seededRandom(0, 0.5);
//         } else if (timing.period === 'late_night') {
//             trafficMultiplier = 0.7 + seededRandom(0, 0.3);
//         }

//         const trafficDuration = baseDuration * trafficMultiplier;

//         return {
//             distance: Math.round(estimatedDistance * 10) / 10,
//             duration: Math.round(baseDuration),
//             trafficDuration: Math.round(trafficDuration)
//         };
//     }

//     static containsSameArea(start, end) {
//         const commonTerms = ['same', 'near', 'close', 'adjacent', 'colony', 'sector', 'block'];
//         return commonTerms.some(term => start.includes(term) || end.includes(term));
//     }

//     static containsOppositeSides(start, end) {
//         const directions = ['east', 'west', 'north', 'south', 'central'];
//         let startDir = directions.find(dir => start.includes(dir));
//         let endDir = directions.find(dir => end.includes(dir));

//         return startDir && endDir && startDir !== endDir;
//     }
// }

// module.exports = intelligentPrices;

class intelligentPrices {
    static cityBaseRates = {
        uber: {
            bike: { base: 8, perKm: 3.5, perMin: 0.25, minFare: 12 },
            auto: { base: 18, perKm: 6, perMin: 0.4, minFare: 25 },
            mini: { base: 22, perKm: 7.5, perMin: 0.6, minFare: 35 },
            sedan: { base: 30, perKm: 9, perMin: 0.8, minFare: 50 },
            suv: { base: 42, perKm: 11, perMin: 1.0, minFare: 70 }
        },
        ola: {
            bike: { base: 9, perKm: 3.2, perMin: 0.22, minFare: 14 },
            auto: { base: 20, perKm: 5.8, perMin: 0.38, minFare: 28 },
            mini: { base: 25, perKm: 7.2, perMin: 0.55, minFare: 38 },
            sedan: { base: 32, perKm: 8.8, perMin: 0.75, minFare: 55 },
            suv: { base: 45, perKm: 10.5, perMin: 0.95, minFare: 75 }
        },
        rapido: {
            bike: { base: 9, perKm: 3.3, perMin: 0.23, minFare: 13 },
            auto: { base: 19, perKm: 5.9, perMin: 0.39, minFare: 27 },
            mini: { base: 24, perKm: 7.1, perMin: 0.56, minFare: 37 },
            sedan: { base: 31, perKm: 8.7, perMin: 0.76, minFare: 54 },
            suv: { base: 43, perKm: 10.4, perMin: 0.96, minFare: 73 }
        }
    }

    // Tier 2 city landmarks and area mapping
    static tier2CityAreas = {
        residential: ['colony', 'nagar', 'vihar', 'puram', 'enclave', 'sector', 'phase', 'block', 'layout'],
        commercial: ['market', 'chowk', 'circle', 'center', 'mall', 'complex', 'plaza', 'bazaar'],
        institutional: ['college', 'university', 'school', 'hospital', 'institute', 'medical'],
        transport: ['station', 'bus stand', 'railway', 'airport', 'depot'],
        zones: ['east', 'west', 'north', 'south', 'central', 'midtown', 'downtown']
    }

    static async intelligentEstimation(startPoint, endPoint) {
        try {
            const routeInfo = await this.getRouteInfo(startPoint, endPoint);
            const timing = this.getCurrentTimingInfo();

            const estimates = {
                uber: {},
                ola: {},
                rapido: {}
            };

            for (const service of ['uber', 'ola', 'rapido']) {
                if (this.cityBaseRates[service]) {
                    for (const [vehicleType, rates] of Object.entries(this.cityBaseRates[service])) {
                        const priceData = this.calculateIntelligentPrice(service, vehicleType, routeInfo, timing);
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
                    trafficDuration: routeInfo.trafficDuration,
                    areaType: routeInfo.areaType,
                    routeComplexity: routeInfo.routeComplexity
                },
                timing: timing,
                source: 'tier2_intelligent_estimation'
            };

        } catch (error) {
            console.error("Pricing error: ", error);
            throw new Error('Could not calculate prices.');
        }
    }

    static calculateIntelligentPrice(service, vehicleType, routeInfo, timing) {
        const rates = this.cityBaseRates[service][vehicleType];
        
        // Tier 2 city specific adjustments
        const tier2Multiplier = this.getTier2Multiplier(routeInfo.areaType, vehicleType);
        
        const distanceCost = routeInfo.distance * rates.perKm * tier2Multiplier.distance;
        const timeCost = routeInfo.trafficDuration * rates.perMin * tier2Multiplier.time;
        let baseFare = (rates.base * tier2Multiplier.base) + distanceCost + timeCost;

        const surge = this.calculateDynamicSurge(timing, routeInfo, service, vehicleType);
        const surgedPrice = baseFare * surge;

        const finalPrice = Math.max(surgedPrice, rates.minFare * tier2Multiplier.minFare);

        const serviceAdjustment = this.getDynamicServiceAdjustment(service, vehicleType, timing, routeInfo);
        const adjustedPrice = finalPrice * serviceAdjustment;

        const roundedPrice = Math.round(adjustedPrice / 5) * 5;

        return {
            price: roundedPrice,
            duration: Math.round(routeInfo.trafficDuration),
            distance: routeInfo.distance,
            surge: parseFloat(surge.toFixed(1)),
            currency: 'INR',
            timing: timing.period,
            serviceAdjustment: serviceAdjustment,
            breakdown: {
                base: Math.round(rates.base * tier2Multiplier.base),
                distance: Math.round(distanceCost),
                time: Math.round(timeCost),
                surge: surge,
                serviceAdjustment: serviceAdjustment,
                areaType: routeInfo.areaType
            }
        };
    }

    static calculateDynamicSurge(timing, routeInfo, service, vehicleType) {
        let surge = 1.0;
        const hour = timing.hour;

        // Base surge patterns based on real-world observations
        if (hour >= 0 && hour < 6) {
            // Late night: Rapido often has higher availability, Uber/Ola moderate
            surge *= 0.9;
            if (service === 'rapido') surge *= 0.95; // More drivers available
        } else if (hour >= 6 && hour < 9) {
            // Morning peak: All services surge, Uber often highest
            surge *= 1.3;
            if (service === 'uber') surge *= 1.1;
            if (vehicleType === 'auto' || vehicleType === 'bike') surge *= 1.05;
        } else if (hour >= 9 && hour < 12) {
            // Morning: Moderate pricing
            surge *= 1.1;
        } else if (hour >= 12 && hour < 14) {
            // Lunch: Ola sometimes offers lunch discounts
            surge *= 1.05;
            if (service === 'ola') surge *= 0.98;
        } else if (hour >= 14 && hour < 17) {
            // Afternoon: Stable pricing
            surge *= 1.0;
        } else if (hour >= 17 && hour < 21) {
            // Evening peak: Highest surges, Uber typically leads
            surge *= 1.4;
            if (service === 'uber') surge *= 1.15;
            if (service === 'ola') surge *= 1.08;
            if (vehicleType === 'suv' || vehicleType === 'sedan') surge *= 1.1;
        } else if (hour >= 21 && hour < 24) {
            // Night: Moderate surge, Rapido often competitive
            surge *= 1.2;
            if (service === 'rapido') surge *= 0.95;
        }

        // Weekend patterns
        if (timing.isWeekend) {
            surge *= 1.15;
            // Weekends: More family travel, SUVs/sedans in demand
            if (vehicleType === 'suv' || vehicleType === 'sedan') {
                surge *= 1.1;
            }
            // Rapido often has weekend promotions
            if (service === 'rapido' && (hour >= 10 && hour < 18)) {
                surge *= 0.92;
            }
        }

        // Distance-based adjustments
        if (routeInfo.distance > 12) {
            // Longer distances: Rapido sometimes more expensive due to bike limitations
            surge *= 0.9;
            if (service === 'rapido' && vehicleType === 'bike') surge *= 1.05;
        } else if (routeInfo.distance < 2) {
            // Short distances: All services charge premium
            surge *= 1.2;
            // Rapido bikes good for short distances
            if (service === 'rapido' && vehicleType === 'bike') surge *= 0.95;
        }

        // Area-based surge
        if (routeInfo.areaType === 'commercial') {
            surge *= 1.15; // Commercial areas always premium
        } else if (routeInfo.areaType === 'institutional') {
            surge *= 1.05;
            // Institutional areas: Ola often has campus partnerships
            if (service === 'ola') surge *= 0.97;
        } else if (routeInfo.areaType === 'transport') {
            surge *= 1.1;
            // Transport hubs: Uber often dominates
            if (service === 'uber') surge *= 1.05;
        }

        // Traffic complexity
        if (routeInfo.routeComplexity === 'high') {
            surge *= 1.15;
        } else if (routeInfo.routeComplexity === 'medium') {
            surge *= 1.08;
        }

        // Service-specific dynamic pricing strategies
        if (service === 'uber') {
            // Uber: Premium positioning, higher during peaks
            if (timing.isPeak) surge *= 1.08;
        } else if (service === 'ola') {
            // Ola: Competitive, often matches or slightly undercuts Uber
            surge *= 0.99;
            if (!timing.isPeak) surge *= 0.97; // More aggressive off-peak
        } else if (service === 'rapido') {
            // Rapido: Most competitive, but not always cheapest
            // Bike services are their strength
            if (vehicleType === 'bike') {
                surge *= 0.92;
            } else {
                // For cars, they're often similar to Ola
                surge *= 0.98;
            }
            // Rapido often has flash promotions
            const shouldHavePromo = (hour % 4 === 0); // Simulating random promotions
            if (shouldHavePromo) surge *= 0.94;
        }

        return Math.max(0.8, Math.min(surge, 2.5));
    }

    static getDynamicServiceAdjustment(service, vehicleType, timing, routeInfo) {
        // Base adjustments that change based on time and conditions
        const baseAdjustments = {
            uber: {
                bike: 1.02,
                auto: 1.04,
                mini: 1.06,
                sedan: 1.08,
                suv: 1.12
            },
            ola: {
                bike: 1.00,
                auto: 1.02,
                mini: 1.04,
                sedan: 1.06,
                suv: 1.10
            },
            rapido: {
                bike: 0.95,
                auto: 1.00,
                mini: 1.02,
                sedan: 1.04,
                suv: 1.06
            }
        };

        let adjustment = baseAdjustments[service]?.[vehicleType] || 1.0;

        // Time-based dynamic adjustments
        if (timing.period === 'evening_peak') {
            if (service === 'uber') adjustment *= 1.03;
            if (service === 'rapido') adjustment *= 0.98;
        } else if (timing.period === 'late_night') {
            if (service === 'rapido') adjustment *= 0.94; // Better late night availability
            if (service === 'ola') adjustment *= 0.97;
        } else if (timing.period === 'lunch') {
            if (service === 'ola') adjustment *= 0.96; // Lunch time discounts
        }

        // Distance-based adjustments
        if (routeInfo.distance > 8) {
            if (service === 'rapido' && vehicleType === 'bike') adjustment *= 1.05;
        }

        // Area-based adjustments
        if (routeInfo.areaType === 'institutional') {
            if (service === 'ola') adjustment *= 0.95;
        }

        return adjustment;
    }

    static getTier2Multiplier(areaType, vehicleType) {
        const multipliers = {
            residential: {
                base: 0.95,
                distance: 1.0,
                time: 0.9,
                minFare: 0.9
            },
            commercial: {
                base: 1.1,
                distance: 1.05,
                time: 1.2,
                minFare: 1.1
            },
            institutional: {
                base: 1.0,
                distance: 1.0,
                time: 1.1,
                minFare: 1.0
            },
            transport: {
                base: 1.05,
                distance: 0.95,
                time: 1.15,
                minFare: 1.05
            },
            default: {
                base: 1.0,
                distance: 1.0,
                time: 1.0,
                minFare: 1.0
            }
        };

        return multipliers[areaType] || multipliers.default;
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
            period = 'morning_peak';
            description = 'Morning Peak (6AM-9AM)';
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
            isPeak: period === 'evening_peak' || period === 'morning_peak'
        };
    }

    // ... (keep the existing getRouteInfo, estimateTier2CityRoute, and other helper methods same as before)
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

        const startAreaType = this.detectAreaType(startHint);
        const endAreaType = this.detectAreaType(endHint);
        const areaType = this.determineDominantAreaType(startAreaType, endAreaType);

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
        let routeComplexity = 'low';

        if (this.isSameNeighborhood(startHint, endHint)) {
            estimatedDistance = 1.5 + seededRandom(0, 2);
            routeComplexity = 'low';
        } else if (this.isAdjacentAreas(startHint, endHint)) {
            estimatedDistance = 3.5 + seededRandom(0, 3);
            routeComplexity = 'medium';
        } else if (this.isOppositeSides(startHint, endHint)) {
            estimatedDistance = 6.5 + seededRandom(0, 4);
            routeComplexity = 'high';
        } else if (this.isCrossCity(startHint, endHint)) {
            estimatedDistance = 10 + seededRandom(0, 6);
            routeComplexity = 'high';
        } else {
            estimatedDistance = 4.5 + seededRandom(0, 4);
            routeComplexity = 'medium';
        }

        if (areaType === 'commercial') {
            estimatedDistance *= 0.9;
        } else if (areaType === 'residential') {
            estimatedDistance *= 1.1;
        }

        const baseSpeed = this.calculateTier2Speed(routeComplexity, areaType);
        const baseDuration = (estimatedDistance / baseSpeed) * 60;

        const timing = this.getCurrentTimingInfo();
        let trafficMultiplier = 1.0;

        if (timing.isPeak) {
            trafficMultiplier = 1.4 + seededRandom(0, 0.3);
        } else if (timing.period === 'late_night') {
            trafficMultiplier = 0.6 + seededRandom(0, 0.2);
        } else if (areaType === 'commercial') {
            trafficMultiplier *= 1.15;
        } else if (areaType === 'institutional') {
            trafficMultiplier *= (timing.hour >= 8 && timing.hour < 16) ? 1.1 : 0.9;
        }

        const trafficDuration = baseDuration * trafficMultiplier;

        return {
            distance: Math.round(estimatedDistance * 10) / 10,
            duration: Math.round(baseDuration),
            trafficDuration: Math.round(trafficDuration),
            areaType: areaType,
            routeComplexity: routeComplexity,
            startArea: startAreaType,
            endArea: endAreaType
        };
    }

    static detectAreaType(address) {
        const addr = address.toLowerCase();
        
        for (const type in this.tier2CityAreas) {
            if (this.tier2CityAreas[type].some(term => addr.includes(term))) {
                return type;
            }
        }
        return 'residential';
    }

    static determineDominantAreaType(startType, endType) {
        if (startType === endType) return startType;
        
        const priority = ['commercial', 'transport', 'institutional', 'residential'];
        for (const type of priority) {
            if (startType === type || endType === type) return type;
        }
        
        return 'residential';
    }

    static calculateTier2Speed(complexity, areaType) {
        const baseSpeeds = {
            low: 22,
            medium: 18,
            high: 14
        };

        let speed = baseSpeeds[complexity] || 18;

        if (areaType === 'commercial') {
            speed *= 0.8;
        } else if (areaType === 'residential') {
            speed *= 1.1;
        } else if (areaType === 'transport') {
            speed *= 0.9;
        }

        return Math.max(10, Math.min(speed, 30));
    }

    static isSameNeighborhood(start, end) {
        const sameAreaIndicators = [
            'same', 'near', 'close', 'adjacent', 'opposite', 'next to',
            'colony', 'nagar', 'sector', 'block', 'phase', 'layout'
        ];
        return sameAreaIndicators.some(term => start.includes(term) || end.includes(term));
    }

    static isAdjacentAreas(start, end) {
        const areaPairs = [
            ['colony', 'market'], ['sector', 'chowk'], ['nagar', 'circle'],
            ['layout', 'center'], ['vihar', 'market']
        ];
        
        return areaPairs.some(pair => 
            (start.includes(pair[0]) && end.includes(pair[1])) ||
            (start.includes(pair[1]) && end.includes(pair[0]))
        );
    }

    static isOppositeSides(start, end) {
        const directions = ['east', 'west', 'north', 'south'];
        let startDir = directions.find(dir => start.includes(dir));
        let endDir = directions.find(dir => end.includes(dir));

        return startDir && endDir && startDir !== endDir;
    }

    static isCrossCity(start, end) {
        const crossCityIndicators = [
            ['airport', 'station'], ['bus stand', 'college'], 
            ['university', 'market'], ['hospital', 'mall']
        ];
        
        return crossCityIndicators.some(pair => 
            (start.includes(pair[0]) && end.includes(pair[1])) ||
            (start.includes(pair[1]) && end.includes(pair[0]))
        );
    }
}

module.exports = intelligentPrices;