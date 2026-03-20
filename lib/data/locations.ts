export interface Location {
  name: string;
  name_bn: string;
  type: "area" | "district";
  district?: string;
  lat: number;
  lng: number;
}

export const locations: Location[] = [
  // --- DHAKA CITY AREAS ---
  { name: "Gulshan", name_bn: "গুলশান", type: "area", district: "Dhaka", lat: 23.7925, lng: 90.4078 },
  { name: "Banani", name_bn: "বনানী", type: "area", district: "Dhaka", lat: 23.7937, lng: 90.4047 },
  { name: "Baridhara", name_bn: "বারিধারা", type: "area", district: "Dhaka", lat: 23.7999, lng: 90.4208 },
  { name: "Dhanmondi", name_bn: "ধানমন্ডি", type: "area", district: "Dhaka", lat: 23.7461, lng: 90.3742 },
  { name: "Uttara", name_bn: "উত্তরা", type: "area", district: "Dhaka", lat: 23.8759, lng: 90.3795 },
  { name: "Bashundhara", name_bn: "বসুন্ধরা", type: "area", district: "Dhaka", lat: 23.8191, lng: 90.4526 },
  { name: "Mirpur", name_bn: "মিরপুর", type: "area", district: "Dhaka", lat: 23.8051, lng: 90.3644 },
  { name: "Mohammadpur", name_bn: "মোহাম্মদপুর", type: "area", district: "Dhaka", lat: 23.7542, lng: 90.3622 },
  { name: "Badda", name_bn: "বাড্ডা", type: "area", district: "Dhaka", lat: 23.7841, lng: 90.4263 },
  { name: "Khilgaon", name_bn: "খিলগাঁও", type: "area", district: "Dhaka", lat: 23.7516, lng: 90.4213 },
  { name: "Motijheel", name_bn: "মতিঝিল", type: "area", district: "Dhaka", lat: 23.7330, lng: 90.4172 },
  { name: "Paltan", name_bn: "পল্টন", type: "area", district: "Dhaka", lat: 23.7358, lng: 90.4117 },
  { name: "Nikunja", name_bn: "নিকুঞ্জ", type: "area", district: "Dhaka", lat: 23.8329, lng: 90.4167 },
  { name: "Tejgaon", name_bn: "তেজগাঁও", type: "area", district: "Dhaka", lat: 23.7600, lng: 90.3950 },
  { name: "Farmgate", name_bn: "ফার্মগেট", type: "area", district: "Dhaka", lat: 23.7561, lng: 90.3872 },
  { name: "Mohakhali", name_bn: "মহাখালী", type: "area", district: "Dhaka", lat: 23.7777, lng: 90.4005 },
  { name: "Savar", name_bn: "সাভার", type: "area", district: "Dhaka", lat: 23.8583, lng: 90.2667 },

  // --- ALL 64 DISTRICTS ---
  // DHAKA DIVISION
  { name: "Dhaka", name_bn: "ঢাকা", type: "district", lat: 23.8103, lng: 90.4125 },
  { name: "Gazipur", name_bn: "গাজীপুর", type: "district", lat: 24.0023, lng: 90.4264 },
  { name: "Kishoreganj", name_bn: "কিশোরগঞ্জ", type: "district", lat: 24.4331, lng: 90.7866 },
  { name: "Manikganj", name_bn: "মানিকগঞ্জ", type: "district", lat: 23.8644, lng: 90.0047 },
  { name: "Munshiganj", name_bn: "মুন্সীগঞ্জ", type: "district", lat: 23.5435, lng: 90.5354 },
  { name: "Narayanganj", name_bn: "নারায়ণগঞ্জ", type: "district", lat: 23.6238, lng: 90.5000 },
  { name: "Narsingdi", name_bn: "নরসিংদী", type: "district", lat: 23.9197, lng: 90.7176 },
  { name: "Tangail", name_bn: "টাঙ্গাইল", type: "district", lat: 24.2513, lng: 89.9167 },
  { name: "Faridpur", name_bn: "ফরিদপুর", type: "district", lat: 23.6071, lng: 89.8429 },
  { name: "Gopalganj", name_bn: "গোপালগঞ্জ", type: "district", lat: 23.0050, lng: 89.8267 },
  { name: "Madaripur", name_bn: "মাদারীপুর", type: "district", lat: 23.1641, lng: 90.1896 },
  { name: "Rajbari", name_bn: "রাজবাড়ী", type: "district", lat: 23.7574, lng: 89.6444 },
  { name: "Shariatpur", name_bn: "শরীয়তপুর", type: "district", lat: 23.2423, lng: 90.3446 },

  // CHITTAGONG DIVISION
  { name: "Chittagong", name_bn: "চট্টগ্রাম", type: "district", lat: 22.3569, lng: 91.7832 },
  { name: "Cox's Bazar", name_bn: "কক্সবাজার", type: "district", lat: 21.4272, lng: 92.0058 },
  { name: "Bandarban", name_bn: "বান্দরবান", type: "district", lat: 22.1953, lng: 92.2184 },
  { name: "Rangamati", name_bn: "রাঙ্গামাটি", type: "district", lat: 22.6533, lng: 92.1750 },
  { name: "Khagrachhari", name_bn: "খাগড়াছড়ি", type: "district", lat: 23.1192, lng: 91.9841 },
  { name: "Feni", name_bn: "ফেনী", type: "district", lat: 23.0159, lng: 91.3976 },
  { name: "Lakshmipur", name_bn: "লক্ষ্মীপুর", type: "district", lat: 22.9426, lng: 90.8417 },
  { name: "Noakhali", name_bn: "নোয়াখালী", type: "district", lat: 22.8696, lng: 91.0991 },
  { name: "Brahmanbaria", name_bn: "ব্রাহ্মণবাড়িয়া", type: "district", lat: 23.9571, lng: 91.1119 },
  { name: "Chandpur", name_bn: "চাঁদপুর", type: "district", lat: 23.2321, lng: 90.6631 },
  { name: "Comilla", name_bn: "কুমিল্লা", type: "district", lat: 23.4607, lng: 91.1809 },

  // SYLHET DIVISION
  { name: "Sylhet", name_bn: "সিলেট", type: "district", lat: 24.8949, lng: 91.8687 },
  { name: "Habiganj", name_bn: "হবিগঞ্জ", type: "district", lat: 24.3749, lng: 91.4168 },
  { name: "Moulvibazar", name_bn: "মৌলভীবাজার", type: "district", lat: 24.4829, lng: 91.7476 },
  { name: "Sunamganj", name_bn: "সুনামগঞ্জ", type: "district", lat: 25.0658, lng: 91.3950 },

  // RAJSHAHI DIVISION
  { name: "Rajshahi", name_bn: "রাজশাহী", type: "district", lat: 24.3745, lng: 88.6042 },
  { name: "Bogra", name_bn: "বগুড়া", type: "district", lat: 24.8481, lng: 89.3730 },
  { name: "Joypurhat", name_bn: "জয়পুরহাট", type: "district", lat: 25.0947, lng: 89.0209 },
  { name: "Naogaon", name_bn: "নওগাঁ", type: "district", lat: 24.7936, lng: 88.9318 },
  { name: "Natore", name_bn: "নাটোর", type: "district", lat: 24.4205, lng: 88.9803 },
  { name: "Chapainawabganj", name_bn: "চাঁপাইনবাবগঞ্জ", type: "district", lat: 24.5965, lng: 88.2711 },
  { name: "Pabna", name_bn: "পাবনা", type: "district", lat: 24.0063, lng: 89.2493 },
  { name: "Sirajganj", name_bn: "সিরাজগঞ্জ", type: "district", lat: 24.4534, lng: 89.7006 },

  // KHULNA DIVISION
  { name: "Khulna", name_bn: "খুলনা", type: "district", lat: 22.8456, lng: 89.5403 },
  { name: "Bagerhat", name_bn: "বাগেরহাট", type: "district", lat: 22.6516, lng: 89.7859 },
  { name: "Chuadanga", name_bn: "চুয়াডাঙ্গা", type: "district", lat: 23.6401, lng: 88.8519 },
  { name: "Jessore", name_bn: "যশোর", type: "district", lat: 23.1664, lng: 89.2128 },
  { name: "Jhenaidah", name_bn: "ঝিনাইদহ", type: "district", lat: 23.5450, lng: 89.1726 },
  { name: "Kushtia", name_bn: "কুষ্টিয়া", type: "district", lat: 23.9013, lng: 89.1204 },
  { name: "Magura", name_bn: "মাগুরা", type: "district", lat: 23.4875, lng: 89.4199 },
  { name: "Meherpur", name_bn: "মেহেরপুর", type: "district", lat: 23.7622, lng: 88.6318 },
  { name: "Narail", name_bn: "নড়াইল", type: "district", lat: 23.1725, lng: 89.5126 },
  { name: "Satkhira", name_bn: "সাতক্ষীরা", type: "district", lat: 22.7185, lng: 89.0705 },

  // BARISAL DIVISION
  { name: "Barisal", name_bn: "বরিশাল", type: "district", lat: 22.7010, lng: 90.3535 },
  { name: "Barguna", name_bn: "বরগুনা", type: "district", lat: 22.0953, lng: 90.1121 },
  { name: "Bhola", name_bn: "ভোলা", type: "district", lat: 22.6859, lng: 90.6440 },
  { name: "Jhalokati", name_bn: "ঝালকাঠি", type: "district", lat: 22.6406, lng: 90.1987 },
  { name: "Patuakhali", name_bn: "পটুয়াখালী", type: "district", lat: 22.3596, lng: 90.3297 },
  { name: "Pirojpur", name_bn: "পিরোজপুর", type: "district", lat: 22.5841, lng: 89.9720 },

  // RANGPUR DIVISION
  { name: "Rangpur", name_bn: "রংপুর", type: "district", lat: 25.7439, lng: 89.2752 },
  { name: "Dinajpur", name_bn: "দিনাজপুর", type: "district", lat: 25.6217, lng: 88.6354 },
  { name: "Gaibandha", name_bn: "গাইবান্ধা", type: "district", lat: 25.3288, lng: 89.5280 },
  { name: "Kurigram", name_bn: "কুড়িগ্রাম", type: "district", lat: 25.8054, lng: 89.6361 },
  { name: "Lalmonirhat", name_bn: "লালমনিরহাট", type: "district", lat: 25.9129, lng: 89.4426 },
  { name: "Nilphamari", name_bn: "নীলফামারী", type: "district", lat: 25.9317, lng: 88.8560 },
  { name: "Panchagarh", name_bn: "পঞ্চগড়", type: "district", lat: 26.3411, lng: 88.5541 },
  { name: "Thakurgaon", name_bn: "ঠাকুরগাঁও", type: "district", lat: 26.0336, lng: 88.4616 },

  // MYMENSINGH DIVISION
  { name: "Mymensingh", name_bn: "ময়মনসিংহ", type: "district", lat: 24.7471, lng: 90.4203 },
  { name: "Jamalpur", name_bn: "জামালপুর", type: "district", lat: 24.9197, lng: 89.9451 },
  { name: "Netrokona", name_bn: "নেত্রকোণা", type: "district", lat: 24.8703, lng: 90.7270 },
  { name: "Sherpur", name_bn: "শেরপুর", type: "district", lat: 25.0189, lng: 90.0175 },

  // TOURISM HOTSPOTS
  { name: "Sajek", name_bn: "সাজেক", type: "area", district: "Rangamati", lat: 23.3820, lng: 92.2938 },
  { name: "Srimangal", name_bn: "শ্রীমঙ্গল", type: "area", district: "Moulvibazar", lat: 24.3065, lng: 91.7295 },
  { name: "Saint Martin's Island", name_bn: "সেন্ট মার্টিন দ্বীপ", type: "area", district: "Cox's Bazar", lat: 20.6276, lng: 92.3233 },
  { name: "Kuakata", name_bn: "কুয়াকাটা", type: "area", district: "Patuakhali", lat: 21.8174, lng: 90.1264 },
];

