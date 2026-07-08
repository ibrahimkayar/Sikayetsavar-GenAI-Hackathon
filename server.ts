import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Helper to generate Ad Poster Design and actual background image using Google's nano banana model (gemini-3.1-flash-lite-image)
async function generateAdPosterData(
  ai: GoogleGenAI,
  brandName: string,
  opportunityTheme: string,
  campaignText: string,
  layoutStyle: string = "Minimal & Bold"
) {
  const posterSchema = {
    type: Type.OBJECT,
    properties: {
      layoutStyle: {
        type: Type.STRING,
        description: "Afiş mizanpaj tarzı"
      },
      headline: {
        type: Type.STRING,
        description: "Afişin ana vurucu başlığı/sloganı (Maksimum 5-6 kelime, çok güçlü ve dürüst)"
      },
      subheadline: {
        type: Type.STRING,
        description: "Başlığı destekleyen, dürüst ve güven veren açıklayıcı alt başlık (1-2 cümle)"
      },
      ctaText: {
        type: Type.STRING,
        description: "Eyleme çağrı butonu metni"
      },
      colorPalette: {
        type: Type.OBJECT,
        properties: {
          primary: { type: Type.STRING, description: "Ana renk (HEX kodu, örn: #0F172A)" },
          secondary: { type: Type.STRING, description: "Yardımcı renk (HEX kodu, örn: #F1F5F9)" },
          accent: { type: Type.STRING, description: "Vurgu rengi (HEX kodu, örn: #F97316)" },
          bgType: { type: Type.STRING, enum: ["light", "dark", "gradient"], description: "Arka plan türü" }
        },
        required: ["primary", "secondary", "accent", "bgType"]
      },
      visualDescription: {
        type: Type.STRING,
        description: "Afişteki görsel kompozisyonun Türkçe detaylı tasviri"
      },
      graphicElements: {
        type: Type.STRING,
        description: "Afişte yer alan ikonlar, şeritler veya dokusal detaylar"
      },
      aiImagePrompt: {
        type: Type.STRING,
        description: "Imagen için profesyonel, sanatsal İngilizce görsel üretim promptu (Metin yazıları içermemeli, sadece saf görsel arka plan/illüstrasyon tasvir edilmeli)"
      }
    },
    required: ["layoutStyle", "headline", "subheadline", "ctaText", "colorPalette", "visualDescription", "graphicElements", "aiImagePrompt"]
  };

  const prompt = `Aşağıdaki kampanya ve marka bilgilerini temel alarak, profesyonel bir reklam ajansının elinden çıkmış gibi gözüken yaratıcı bir Basılı / Dijital Reklam Afişi (Poster) tasarımı konsepti oluştur:
- Marka Adı: ${brandName}
- Kampanya Teması: ${opportunityTheme}
- Kampanya Metni: ${campaignText}
- İstenen Afiş Tarzı: ${layoutStyle}

Afiş tasarımı son derece dürüst, modern, minimal ve güven aşılayan bir yapıda olmalıdır. Şikayeti zekice kucaklayıp güce dönüştürmelidir.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: posterSchema,
      systemInstruction: `Sen ${brandName} için çalışan ödüllü bir kreatif direktör ve grafik tasarımcısın.
Müşterinin geçmiş şikayetini dürüstçe karşılayıp markayı ileriye taşıyan akıllı bir basılı/dijital ilan afişi tasarlayacaksın.

Afişin ana başlığı (headline) akılda kalıcı, kısa ve cesur olmalıdır. Abartılı vaatler veya aşırı mükemmeliyetçi dillerden kaçın, dürüst ve çözüm odaklı ol.
Renk paletini markanın duruşuna uygun, modern ve şık seç.
Midjourney/Imagen promptunu (aiImagePrompt) profesyonel kalitede, reklamcılık estetiğine uygun, metinsiz (no text, letterings, words) olarak İngilizce formatta detaylandır.`
    }
  });

  const posterText = response.text?.trim() || "{}";
  const poster = JSON.parse(posterText);

  // Generate poster background image using Google's Imagen 3 model (imagen-3.0-generate-002)
  let imageUrl = null;
  try {
    const imageResponse = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt: poster.aiImagePrompt || `A professional high-quality advertisement background visual for ${brandName}, beautiful digital marketing graphic concept, 16:9 aspect ratio`,
      config: {
        numberOfImages: 1,
        outputMimeType: "image/png",
        aspectRatio: "16:9"
      }
    });

    if (imageResponse.generatedImages?.[0]?.image?.imageBytes) {
      imageUrl = `data:image/png;base64,${imageResponse.generatedImages[0].image.imageBytes}`;
    }
  } catch (imageErr) {
    console.error("Imagen 3 image generation error:", imageErr);
  }

  return {
    ...poster,
    imageUrl
  };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route to handle the 3-step complaint pipeline
  app.post("/api/process-complaint", async (req, res) => {
    try {
      const { complaint, brandName = "Hızlı Kargo", channel = "Sosyal Medya" } = req.body;

      if (!complaint || typeof complaint !== "string" || !complaint.trim()) {
        return res.status(400).json({ error: "Lütfen geçerli bir şikayet metni girin." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY tanımlı değil. Lütfen sağ üstteki 'Settings > Secrets' panelinden API anahtarınızı ekleyin."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // 1. Analiz Aşaması (Zero-shot + Yapılandırılmış)
      const analysisSchema = {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: "Kategori. Şu değerlerden biri olmalıdır: 'kargo', 'ürün', 'fiyat', 'hizmet', 'diğer'."
          },
          sentiment: {
            type: Type.STRING,
            description: "Duygu. Şu değerlerden biri olmalıdır: 'negatif', 'nötr', 'pozitif'."
          },
          severity: {
            type: Type.STRING,
            description: "Ciddiyet derecesi. Şu değerlerden biri olmalıdır: 'düşük', 'orta', 'yüksek'."
          },
          mainIssue: {
            type: Type.STRING,
            description: "Şikayetin ana sorunu (tek cümle halinde özetlenmiş)."
          }
        },
        required: ["category", "sentiment", "severity", "mainIssue"]
      };

      const step1Response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Aşağıdaki müşteri yorumunu analiz et. Sadece belirtilen formatta yanıt ver.
Yorum: "${complaint}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: analysisSchema,
          systemInstruction: "Müşteri yorumlarını analiz eden profesyonel bir uzmansın. Yorumu analiz edip 'kargo', 'ürün', 'fiyat', 'hizmet' veya 'diğer' kategorisine ayır. Duygusunu 'negatif', 'nötr' veya 'pozitif' yap. Ciddiyet derecesini 'düşük', 'orta' veya 'yüksek' yap. Ana sorunu tek cümle halinde özetle."
        }
      });

      const analysisText = step1Response.text?.trim() || "{}";
      let analysis;
      try {
        analysis = JSON.parse(analysisText);
      } catch (err) {
        throw new Error("Analiz sonucu JSON formatına dönüştürülemedi: " + analysisText);
      }

      // Etik kontrol: Ciddiyet derecesi yüksek ise süreci durdur ve uyar
      const isHighSeverity = analysis.severity === "yüksek";
      if (isHighSeverity) {
        return res.json({
          id: Math.random().toString(36).substring(7),
          complaint,
          brandName,
          channel,
          timestamp: new Date().toISOString(),
          analysis: {
            category: analysis.category || "diğer",
            sentiment: analysis.sentiment || "negatif",
            severity: "yüksek",
            mainIssue: analysis.mainIssue || "Ciddi sorun tespit edildi."
          },
          requiresHumanIntervention: true,
          opportunity: null,
          campaign: null,
          adPoster: null
        });
      }

      // 2. Tersine Çevirme Aşaması (Few-shot + Chain of thought)
      const inversionSchema = {
        type: Type.OBJECT,
        properties: {
          chainOfThoughtStep1: {
            type: Type.STRING,
            description: "Şikayetin özündeki gerçek ihtiyaç nedir?"
          },
          chainOfThoughtStep2: {
            type: Type.STRING,
            description: "Marka bu ihtiyacı nasıl bir güce çevirebilir?"
          },
          opportunityTheme: {
            type: Type.STRING,
            description: "Bunu tek bir kampanya veya çözüm temasıyla ifade et."
          }
        },
        required: ["chainOfThoughtStep1", "chainOfThoughtStep2", "opportunityTheme"]
      };

      const step2Response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Müşteri Şikayeti: "${complaint}"
Analiz Sonuçları:
- Kategori: ${analysis.category}
- Duygu: ${analysis.sentiment}
- Ciddiyet: ${analysis.severity}
- Ana Sorun: ${analysis.mainIssue}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: inversionSchema,
          systemInstruction: `Sen bir pazarlama stratejistisin. Bir müşteri şikayetini, markanın güçlü yanına dönüştürülebilecek bir kampanya temasına çeviriyorsun.

Örnekler:
Şikayet: "Kargo çok geç geliyor" → Fırsat teması: "24 Saat Teslimat Garantisi Kampanyası"
Şikayet: "Ürün açıklamaları yetersiz" → Fırsat teması: "Şeffaf Ürün Bilgisi İnisiyatifi"

Şimdi adım adım düşün:
1. Şikayetin özündeki gerçek ihtiyaç nedir?
2. Marka bu ihtiyacı nasıl bir güce çevirebilir?
3. Bunu tek bir kampanya temasıyla ifade et.`
        }
      });

      const inversionText = step2Response.text?.trim() || "{}";
      let opportunity;
      try {
        opportunity = JSON.parse(inversionText);
      } catch (err) {
        throw new Error("Fırsata çevirme sonucu JSON formatına dönüştürülemedi: " + inversionText);
      }

      // 3. Kampanya Üretim Aşaması (Rol tanımlı + kısıtlamalı prompt)
      const campaignSchema = {
        type: Type.OBJECT,
        properties: {
          campaignText: {
            type: Type.STRING,
            description: "Üretilen nihai kampanya metni."
          }
        },
        required: ["campaignText"]
      };

      const step3Response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Kanal: ${channel}
Kampanya teması: ${opportunity.opportunityTheme}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: campaignSchema,
          systemInstruction: `Sen ${brandName} için yaratıcı bir içerik yazarısın. Marka sesi: samimi, güven veren, abartısız.
Aşağıdaki kampanya temasını, seçilen kanala (${channel}) uygun kısa bir metne dönüştür.

Kurallar:
- Kesin taahhüt niteliğinde ifadeler kullanma (örn. "garanti", "kesinlikle" gibi kelimelerden kaçın, bunun yerine "hedefliyoruz", "çalışıyoruz", "çabalıyoruz", "özen gösteriyoruz" gibi ifadeler kullan).
- Maksimum 3 cümle.`
        }
      });

      const campaignTextOutput = step3Response.text?.trim() || "{}";
      let campaign;
      try {
        campaign = JSON.parse(campaignTextOutput);
      } catch (err) {
        throw new Error("Kampanya metni sonucu JSON formatına dönüştürülemedi: " + campaignTextOutput);
      }

      // Kampanyadan Afiş Üretme Paneli Artık Varsayılan Olarak Açık ve Görünür olsun diye otomatik afiş üretiyoruz!
      let adPoster = null;
      try {
        adPoster = await generateAdPosterData(
          ai,
          brandName,
          opportunity.opportunityTheme || "",
          campaign.campaignText || "",
          "Minimal & Bold"
        );
      } catch (posterErr) {
        console.error("Error generating default ad poster:", posterErr);
      }

      return res.json({
        id: Math.random().toString(36).substring(7),
        complaint,
        brandName,
        channel,
        timestamp: new Date().toISOString(),
        analysis: {
          category: analysis.category || "diğer",
          sentiment: analysis.sentiment || "negatif",
          severity: analysis.severity || "orta",
          mainIssue: analysis.mainIssue || ""
        },
        requiresHumanIntervention: false,
        opportunity: {
          chainOfThoughtStep1: opportunity.chainOfThoughtStep1 || "",
          chainOfThoughtStep2: opportunity.chainOfThoughtStep2 || "",
          opportunityTheme: opportunity.opportunityTheme || ""
        },
        campaign: {
          campaignText: campaign.campaignText || "",
          channel,
          brandName
        },
        adPoster
      });

    } catch (error: any) {
      console.error("Pipeline processing error:", error);
      return res.status(500).json({ error: error.message || "İşlem sırasında bir hata oluştu." });
    }
  });

  // API Route to generate Ad Poster Design based on Campaign results (or manual trigger / recreate style)
  app.post("/api/generate-ad-poster", async (req, res) => {
    try {
      const { campaignText, opportunityTheme, brandName = "Hızlı Kargo", layoutStyle = "Minimal & Bold" } = req.body;

      if (!campaignText || !opportunityTheme) {
        return res.status(400).json({ error: "Kampanya metni ve teması gereklidir." });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "GEMINI_API_KEY tanımlı değil."
        });
      }

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const poster = await generateAdPosterData(
        ai,
        brandName,
        opportunityTheme,
        campaignText,
        layoutStyle
      );

      return res.json(poster);

    } catch (error: any) {
      console.error("Poster Generation error:", error);
      return res.status(500).json({ error: error.message || "Reklam afişi tasarımı üretilemedi." });
    }
  });

  // Serve static/Vite assets
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
