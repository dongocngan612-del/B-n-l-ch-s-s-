const apiKey = ""; // để trống nếu chưa dùng Gemini

// ===== DỮ LIỆU LỊCH SỬ =====
const historyEvents = [
    { 
        id: 1,
        title: "Chiến thắng Bạch Đằng",
        year: "938",
        era: "Thời Ngô",
        location: [20.849, 106.657],
        image: "image_751c49.jpg",
        fallback: "https://www.kidsup.net/wp-content/uploads/2025/07/boi-canh-lich-su-thoi-ngo-quyen.jpg",
        desc: "Ngô Quyền dùng kế cắm cọc gỗ nhọn trên sông Bạch Đằng tiêu diệt quân Nam Hán, kết thúc nghìn năm Bắc thuộc."
    },
    { 
        id: 2,
        title: "Lý Thái Tổ Dời Đô",
        year: "1010",
        era: "Thời Lý",
        location: [21.036, 105.834],
        image: "image_75722a.jpg",
        fallback: "https://photo.znews.vn/w1920/Uploaded/dqmblcvo/2020_08_03/72319060_2432162433500377_8155838751289901056_o.jpg",
        desc: "Vua Lý Công Uẩn ban Chiếu dời đô từ Hoa Lư về Đại La, đổi tên thành Thăng Long."
    },
    { 
        id: 3,
        title: "Chiến thắng Đống Đa",
        year: "1789",
        era: "Tây Sơn",
        location: [21.002, 105.821],
        image: "image_751cc7.png",
        fallback: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Battle_at_the_River_Tho-xuong.jpg/500px-Battle_at_the_River_Tho-xuong.jpg",
        desc: "Vua Quang Trung hành quân thần tốc quét sạch 29 vạn quân Thanh trong Tết Kỷ Dậu."
    },
    { 
        id: 4,
        title: "Chiến thắng Điện Biên Phủ",
        year: "1954",
        era: "Chống Pháp",
        location: [21.388, 103.018],
        image: "image_756f42.jpg",
        fallback: "https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2023/5/7/1189327/Chien-Thang-Dien-Bie.jpg",
        desc: "Chiến thắng vĩ đại kết thúc ách thống trị của thực dân Pháp tại Đông Dương."
    },
    { 
        id: 5,
        title: "Giải phóng Miền Nam",
        year: "1975",
        era: "Chống Mỹ",
        location: [10.777, 106.695],
        image: "image_7579ca.jpg",
        fallback: "https://imgnvsk.vnanet.vn/MediaUpload/Content/2025/04/16/116-15-33-31.jpg",
        desc: "Chiến dịch Hồ Chí Minh lịch sử, thống nhất đất nước Việt Nam."
    }
];

// ===== KHỞI TẠO BẢN ĐỒ =====
const map = L.map('map', { zoomControl: false }).setView([16.0, 108.0], 6);
L.tileLayer(
    'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png'
).addTo(map);

// ===== AI (TÙY CHỌN) =====
async function askGemini(prompt) {
    if (!apiKey) return "Chức năng AI chưa được kích hoạt.";
    try {
        const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }]
                })
            }
        );
        const data = await res.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "Không có phản hồi.";
    } catch {
        return "Lỗi kết nối AI.";
    }
}

// ===== HIỂN THỊ THÔNG TIN =====
function showInfo(id) {
    const event = historyEvents.find(e => e.id === id);
    const panel = document.getElementById("info-panel");
    const content = document.getElementById("panel-content");

    panel.classList.remove("hidden");
    setTimeout(() => panel.style.transform = "translateX(0)", 10);

    content.innerHTML = `
        <div class="relative h-56 bg-stone-200">
            <img src="${event.image}" class="w-full h-full object-cover"
                 onerror="this.src='${event.fallback}'">
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div class="absolute bottom-4 left-6 text-white">
                <span class="text-[9px] font-bold uppercase tracking-widest text-orange-400">${event.era}</span>
                <h2 class="text-2xl font-black">${event.title}</h2>
            </div>
        </div>
        <div class="p-6">
            <p class="text-sm text-stone-600 mb-6">${event.desc}</p>
            <button onclick="getAIInsight(${id})"
                class="w-full py-3 bg-stone-900 text-white rounded-2xl text-[10px] font-bold">
                PHÂN TÍCH Ý NGHĨA ✨
            </button>
        </div>
    `;

    map.flyTo(event.location, 12);
    document.querySelectorAll(".timeline-item").forEach(el => el.classList.remove("active-event"));
    document.getElementById(`timeline-${id}`).classList.add("active-event");
}

async function getAIInsight(id) {
    const event = historyEvents.find(e => e.id === id);
    const box = document.getElementById("ai-insight-box");
    const text = document.getElementById("ai-insight-text");

    box.classList.remove("hidden");
    text.innerText = "Đang phân tích...";
    text.innerText = await askGemini(`Nêu ngắn gọn 2 ý nghĩa lịch sử của ${event.title} năm ${event.year}.`);
}

// ===== CHAT =====
function toggleChat() {
    document.getElementById("ai-chat-panel").classList.toggle("hidden");
}

function closePanel() {
    document.getElementById("info-panel").style.transform = "translateX(110%)";
}

// ===== TIMELINE + MARKER =====
const timeline = document.getElementById("timeline-list");
historyEvents.forEach(e => {
    L.marker(e.location).addTo(map).on("click", () => showInfo(e.id));

    const div = document.createElement("div");
    div.id = `timeline-${e.id}`;
    div.className =
        "timeline-item bg-white px-5 py-3 rounded-2xl border cursor-pointer w-40 shrink-0";
    div.innerHTML = `
        <p class="text-[9px] font-bold text-orange-600">${e.year}</p>
        <p class="text-xs font-bold truncate">${e.title}</p>
    `;
    div.onclick = () => showInfo(e.id);
    timeline.appendChild(div);
});
<script src="script.js"></script>

