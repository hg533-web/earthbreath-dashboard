import './Home.css';
import React, { useState, useEffect, useRef } from 'react';
import homePic2 from "../assets/pic/home_page/home_pic2.png";
import homePic3 from "../assets/pic/home_page/home_pic3.png";
import homePic4 from "../assets/pic/home_page/home_pic4.png";
import homePic5 from "../assets/pic/home_page/home_pic5.png";
// 叙事文本数据 (使用英文版本)
const storyPoints = [
  {
    mainTitle: "Information Silos",
    question: "Opening dozens of websites for scattered climate data?",
    subtitle: "Pain Point 1: Time-consuming effort, fragmented information",
    description: "You have to visit NASA for global CO2 concentrations, NOAA for ocean temperatures, and local sites for health data. Information is scattered, and integration is time-consuming.",
    elementId: "story-1",
    layout: "left",
    image: homePic3
  },
  {
    mainTitle: "Raw Data Swamp",
    question: "Finding incomprehensible ZIP files instead of dashboards?",
    subtitle: "Pain Point 2: Lack of intuitive visualization and public interpretation",
    description: "Even when collected, you are faced with raw, non-visualized tables and files, lacking intuitive understanding and simple interpretation for the general public. Value is trapped in the data.",
    elementId: "story-2",
    layout: "right",
    image: homePic2
  },
  {
    mainTitle: "The Uncontextualized",
    question: "AQI is 150. Does that mean I should take the subway or wear a mask?",
    subtitle: "Pain Point 3: Lack of personal, professional interpretation.",
    description: "Even with current air quality apps (AQI, PM2.5), non-experts, especially asthma patients, lack professional understanding of what these numbers mean for their specific health risks and whether they need to change their travel plans today. The data is uncontextualized and not actionable.",
    elementId: "story-3",
    layout: "left",
    image: homePic4
  },
  
  // STORY 4: No Foresight (New Pain Point 2)
  {
    mainTitle: "No Foresight",
    question: "I need to plan my weekend commute. What will the air quality be in three days?",
    subtitle: "Pain Point 4: Zero predictive capability.",
    description: "Current health and environmental apps only offer real-time or historical data. They fail to provide New York asthma patients with a predictive outlook, such as a 3-day travel risk forecast, leaving users unable to proactively plan their essential commutes or outdoor activities.",
    elementId: "story-4",
    layout: "right",
    image: homePic5 // Image placeholder
  },
  {
    mainTitle: "The Solution",
    question: "An integrated, visualized, and intuitive platform.",
    subtitle: "Value Proposition: Climate health data made accessible and clear.",
    description: "Our platform integrates all key indicators into one interface, using vivid charts and clear interpretations to make climate health data accessible and understandable at a glance.",
    elementId: "story-5",
    layout: "left"
  },
];

// Initialize refs for all story sections
const initialRefs: React.RefObject<HTMLElement | null>[] = storyPoints.map(() => React.createRef<HTMLElement | null>());

export function Home() {
    // 状态用于存储每个部分的滚动动画样式
    const [sectionStyles, setSectionStyles] = useState<{ [key: string]: React.CSSProperties }>({}); 
    const sectionsRef = useRef<React.RefObject<HTMLElement | null>[]>(initialRefs);
    
    // 状态用于控制卡片的翻转
    const [flippedCards, setFlippedCards] = useState<{ [key: string]: boolean }>({});

    const toggleCard = (cardId: string) => {
        setFlippedCards(prev => ({
            ...prev,
            [cardId]: !prev[cardId]
        }));
    }; 

    useEffect(() => {
        const handleScroll = () => {
            const windowHeight = window.innerHeight;
            const newStyles: { [key: string]: React.CSSProperties } = {};

            sectionsRef.current.forEach((ref, index) => {
                const section = ref.current;
                if (section) {
                    const rect = section.getBoundingClientRect();
                    
                    // 元素相对于视口中心的位置（-0.5到0.5之间，0为中心）
                    const centerOffset = (rect.top + rect.height / 2 - windowHeight / 2) / windowHeight;
                    
                    // 确保值在 [-1, 1] 范围内
                    const clampedOffset = Math.max(-1, Math.min(1, centerOffset));

                    // ============ 动画计算逻辑 ============
                    
                    // 1. 透明度 (Opacity): 元素在接近中心 (0) 时完全显示 (1)。
                    // |clampedOffset| 越小，opacity 越高。
                    // 使用 Math.abs(clampedOffset) * 2 来计算淡出速率
                    const opacity = 1 - Math.abs(clampedOffset) * 1.5; // 1.5是淡出强度

                    // 2. 垂直移动 (Parallax/Transition): 元素在滚动时有轻微的偏移。
                    // 在向上滚动时，文本相对于其他内容轻微向下（正值），产生视差。
                    const yOffset = clampedOffset * 150; // 150px 是最大偏移量

                    newStyles[storyPoints[index].elementId] = {
                        opacity: Math.max(0, opacity), // 确保 opacity 不为负
                        transform: `translateY(${yOffset}px)`,
                        // 让动画过渡更平滑
                        transition: 'opacity 0.1s ease-out' 
                    };
                }
            });
            setSectionStyles(newStyles);
        };

        window.addEventListener('scroll', handleScroll);
        // 首次加载时执行一次，确保初始状态正确
        handleScroll(); 
        
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);


    return (
      <div className="home-page">
          <div className="story-wrapper">
              
              <div className="scroll-content">
                  {storyPoints.map((point, index) => {
                      // Special layout for story-5 (The Solution)
                      if (point.elementId === 'story-5') {
                          return (
                              <section
                                  key={point.elementId}
                                  id={point.elementId}
                                  className="story-section story-section-hero"
                                  ref={sectionsRef.current[index]}
                                  style={sectionStyles[point.elementId]}
                              >
                                  <div className="hero">
                                      <p className="eyebrow">Dashboard Preview</p>
                                      <h1>Global & NYC Climate Health Monitoring Platform</h1>
                                      <p>
                                          This project includes global climate indicators, individual greenhouse gas pages,
                                          NYC local climate and asthma data, as well as user authentication and settings.
                                          Currently, we're building the layout and navigation framework.
                                      </p>
                                  </div>
                              </section>
                          );
                      }

                      // Regular story layout for other sections
                      return (
                          <section
                              key={point.elementId}
                              id={point.elementId}
                              className={`story-section story-section-${point.layout}`}
                              ref={sectionsRef.current[index]}
                          >
                              {/* 核心内容区：包含文本、图片和内容卡片 */}
                              <div className="section-content-wrapper">

                                  {/* A. 叙事文本单元 (始终有) */}
                                  <div 
                                      className={`story-text-floating story-text-${point.layout}`}
                                      style={sectionStyles[point.elementId]}
                                  >
                                      <h2>
                                          {point.mainTitle}
                                          <br />
                                          <span className="question-line">{point.question}</span>
                                      </h2>
                                  </div>
                                  
                                  {/* B. 图片单元 */}
                                  {point.image && (
                                      <img 
                                          src={point.image} 
                                          alt={`Visual for ${point.mainTitle}`} 
                                          className={`story-image story-image-${point.layout}`} 
                                          style={sectionStyles[point.elementId]}
                                      />
                                  )}

                                  {/* C. 详细描述单元 (Content Card) */}
                                  <div className={`content-card content-card-${point.layout === 'left' ? 'right' : 'left'}`}>
                                      <h3>{point.subtitle}</h3>
                                      <p>{point.description}</p>
                                  </div>
                              </div>
                          </section>
                      );
                  })}
              </div>
          </div>
          
          {/* Feature Grid Section */}
          <section className="grid">
            <div 
              className={`flip-card ${flippedCards['card-1'] ? 'flipped' : ''}`}
              onClick={() => toggleCard('card-1')}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <h2>Global Dashboard</h2>
                  <p className="flip-hint">Click to learn more</p>
                </div>
                <div className="flip-card-back">
                  <h2>Global Dashboard</h2>
                  <p>Overview cards, global map, and placeholder areas for time and region filters.</p>
                </div>
              </div>
            </div>

            <div 
              className={`flip-card ${flippedCards['card-2'] ? 'flipped' : ''}`}
              onClick={() => toggleCard('card-2')}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <h2>Individual Gas Pages</h2>
                  <p className="flip-hint">Click to learn more</p>
                </div>
                <div className="flip-card-back">
                  <h2>Individual Gas Pages</h2>
                  <p>Trend and regional comparison for each gas type, placeholder modules await data.</p>
                </div>
              </div>
            </div>

            <div 
              className={`flip-card ${flippedCards['card-3'] ? 'flipped' : ''}`}
              onClick={() => toggleCard('card-3')}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <h2>NYC Dashboard</h2>
                  <p className="flip-hint">Click to learn more</p>
                </div>
                <div className="flip-card-back">
                  <h2>NYC Dashboard</h2>
                  <p>Visualization layout for NYC climate, asthma cases, and hospital resources.</p>
                </div>
              </div>
            </div>

            <div 
              className={`flip-card ${flippedCards['card-4'] ? 'flipped' : ''}`}
              onClick={() => toggleCard('card-4')}
            >
              <div className="flip-card-inner">
                <div className="flip-card-front">
                  <h2>Auth & Settings</h2>
                  <p className="flip-hint">Click to learn more</p>
                </div>
                <div className="flip-card-back">
                  <h2>Auth & Settings</h2>
                  <p>Login, registration, and personal preference settings placeholder forms.</p>
                </div>
              </div>
            </div>
          </section>
          
      </div>
  );
}