"""
Personalized Risk Score Calculator
Considers user questionnaire data for personalized risk assessment
"""
import json
from typing import Optional, Dict, Any
from app.models.user import User

class PersonalizedRiskCalculator:
    """Calculate personalized risk score based on user profile"""
    
    @staticmethod
    def get_severity_multiplier(asthma_severity: Optional[str]) -> float:
        """Get risk multiplier based on asthma severity"""
        multipliers = {
            'mild': 0.8,        # 轻微哮喘，风险降低20%
            'moderate': 1.0,    # 中等，不调整
            'severe': 1.5,      # 严重，风险增加50%
            None: 1.0           # 未知，不调整
        }
        return multipliers.get(asthma_severity, 1.0)
    
    @staticmethod
    def get_control_multiplier(asthma_control: Optional[str]) -> float:
        """Get risk multiplier based on asthma control level"""
        multipliers = {
            'well-controlled': 0.9,           # 控制良好，风险降低10%
            'partially-controlled': 1.1,      # 部分控制，风险增加10%
            'poorly-controlled': 1.3,         # 控制不佳，风险增加30%
            None: 1.0
        }
        return multipliers.get(asthma_control, 1.0)
    
    @staticmethod
    def get_symptom_frequency_multiplier(symptom_frequency: Optional[str]) -> float:
        """Get risk multiplier based on symptom frequency"""
        multipliers = {
            'daily': 1.4,       # 每天有症状，风险增加40%
            'weekly': 1.2,      # 每周有症状，风险增加20%
            'monthly': 1.0,     # 每月有症状，不调整
            'rarely': 0.9,      # 很少，风险降低10%
            None: 1.0
        }
        return multipliers.get(symptom_frequency, 1.0)
    
    @staticmethod
    def calculate_trigger_sensitivity(
        trigger_factors: Optional[str], 
        climate_data: Dict[str, Any]
    ) -> float:
        """
        Calculate trigger sensitivity based on user's trigger factors and current climate
        
        Args:
            trigger_factors: JSON string of trigger factors list
            climate_data: Current climate/air quality data
        
        Returns:
            Sensitivity multiplier (1.0 = no adjustment, >1.0 = more sensitive)
        """
        if not trigger_factors:
            return 1.0
        
        try:
            triggers = json.loads(trigger_factors) if isinstance(trigger_factors, str) else trigger_factors
            if not isinstance(triggers, list):
                return 1.0
        except:
            return 1.0
        
        sensitivity = 1.0
        
        # Check each trigger factor against climate data
        trigger_mapping = {
            'pollen': ('pollen_count', 1.3),      # 如果触发因素是pollen，且pollen高，风险增加
            'air_quality': ('aqi', 1.2),
            'cold_air': ('temperature', 1.2),
            'humidity': ('humidity', 1.15),
            'wind': ('wind_speed', 1.1),
            'pollution': ('pm25', 1.25),
            'ozone': ('o3', 1.2),
        }
        
        for trigger in triggers:
            trigger_lower = trigger.lower()
            
            # Check if this trigger is relevant to current conditions
            for key, (metric, multiplier) in trigger_mapping.items():
                if key in trigger_lower:
                    value = climate_data.get(metric)
                    if value is not None:
                        # If conditions are unfavorable, increase sensitivity
                        if key == 'cold_air' and value < 10:
                            sensitivity *= multiplier
                        elif key == 'humidity' and value > 70:
                            sensitivity *= multiplier
                        elif key == 'wind' and value > 10:
                            sensitivity *= multiplier
                        elif key == 'pollen' and value > 50:
                            sensitivity *= multiplier
                        elif key in ['air_quality', 'pollution', 'ozone']:
                            # For air quality metrics, higher values = more sensitive
                            thresholds = {
                                'aqi': 50,
                                'pm25': 25,
                                'o3': 0.06
                            }
                            if value > thresholds.get(metric, 0):
                                sensitivity *= multiplier
        
        return min(sensitivity, 2.0)  # Cap at 2x multiplier
    
    @classmethod
    def calculate_personalized_risk_score(
        cls,
        base_risk_score: float,
        user: Optional[User],
        climate_data: Dict[str, Any]
    ) -> float:
        """
        Calculate personalized risk score based on user profile
        
        Args:
            base_risk_score: Base risk score from algorithm
            user: User model with questionnaire data
            climate_data: Current climate/air quality data
        
        Returns:
            Personalized risk score
        """
        if not user:
            return base_risk_score
        
        # Start with base risk score
        personalized_risk = base_risk_score
        
        # Apply severity multiplier
        severity_mult = cls.get_severity_multiplier(user.asthma_severity)
        personalized_risk *= severity_mult
        
        # Apply control level multiplier
        control_mult = cls.get_control_multiplier(user.asthma_control)
        personalized_risk *= control_mult
        
        # Apply symptom frequency multiplier
        symptom_mult = cls.get_symptom_frequency_multiplier(user.symptom_frequency)
        personalized_risk *= symptom_mult
        
        # Apply trigger sensitivity
        trigger_sensitivity = cls.calculate_trigger_sensitivity(
            user.trigger_factors, 
            climate_data
        )
        personalized_risk *= trigger_sensitivity
        
        # Ensure score stays within 0-100 range
        personalized_risk = max(0, min(100, personalized_risk))
        
        return round(personalized_risk, 1)

