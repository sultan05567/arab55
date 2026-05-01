import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

const groceryProducts = [
  { name: 'حليب نادك طازج (1 لتر)', category: 'ألبان', price: 6, stock: 50, sku: 'GRC-001', imageUrl: 'https://images.unsplash.com/photo-1563636619-e9150fa4ba0d?auto=format&fit=crop&q=80&w=400' },
  { name: 'خبز لوزين توست', category: 'مخبوزات', price: 5.5, stock: 30, sku: 'GRC-002', imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=400' },
  { name: 'أرز بسمتي (5 كجم)', category: 'بقالة جافة', price: 45, stock: 20, sku: 'GRC-003', imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400' },
  { name: 'بيض مزارع طازج (30 حبة)', category: 'بيض وألبان', price: 18, stock: 15, sku: 'GRC-004', imageUrl: 'https://images.unsplash.com/photo-1518569190539-7f61c606a651?auto=format&fit=crop&q=80&w=400' },
  { name: 'بيبسي عائلي (2.25 لتر)', category: 'مشروبات', price: 10, stock: 40, sku: 'GRC-005', imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?auto=format&fit=crop&q=80&w=400' },
  { name: 'مياه نوفا (6 * 1.5 لتر)', category: 'مشروبات', price: 12, stock: 100, sku: 'GRC-006', imageUrl: 'https://images.unsplash.com/photo-1523362622666-4c59d4b04803?auto=format&fit=crop&q=80&w=400' },
  { name: 'بسكويت أوريو كبير', category: 'سناكس', price: 15, stock: 60, sku: 'GRC-007', imageUrl: 'https://images.unsplash.com/photo-1558961312-50346c09f4d5?auto=format&fit=crop&q=80&w=400' },
  { name: 'تفاح أحمر أمريكي (1 كجم)', category: 'فواكه وخضروات', price: 9, stock: 25, sku: 'GRC-008', imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&q=80&w=400' },
  { name: 'موز هندي (1 كجم)', category: 'فواكه وخضروات', price: 6, stock: 35, sku: 'GRC-009', imageUrl: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&q=80&w=400' },
  { name: 'طماطم طازجة (1 كجم)', category: 'فواكه وخضروات', price: 4.5, stock: 40, sku: 'GRC-010', imageUrl: 'https://images.unsplash.com/photo-1597362868123-d5144f0ce47c?auto=format&fit=crop&q=80&w=400' },
  { name: 'زيت دوار الشمس (1.5 لتر)', category: 'زيوت وطبخ', price: 19, stock: 20, sku: 'GRC-011', imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400' },
  { name: 'شاي ليبتون (100 كيس)', category: 'مشروبات ساخنة', price: 16, stock: 30, sku: 'GRC-012', imageUrl: 'https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&q=80&w=400' },
  { name: 'جبنة مراعي (500 جرام)', category: 'بيض وألبان', price: 14, stock: 25, sku: 'GRC-013', imageUrl: 'https://images.unsplash.com/photo-1486297678162-ad249ff1f431?auto=format&fit=crop&q=80&w=400' },
  { name: 'كورن فليكس كلوقز', category: 'فطور', price: 22, stock: 15, sku: 'GRC-014', imageUrl: 'https://images.unsplash.com/photo-1582401232440-279541a0678d?auto=format&fit=crop&q=80&w=400' },
  { name: 'عسل نحل طبيعي', category: 'فطور', price: 35, stock: 10, sku: 'GRC-015', imageUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&q=80&w=400' },
  { name: 'معكرونة قودي (500 جرام)', category: 'بقالة جافة', price: 5, stock: 45, sku: 'GRC-016', imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=400' },
];

const cafeProducts = [
  { name: 'إسبريسو سينجل', category: 'قهوة ساخنة', price: 9, stock: 999, sku: 'CFE-001', imageUrl: 'https://images.unsplash.com/photo-1510707577719-afeb212024ca?auto=format&fit=crop&q=80&w=400' },
  { name: 'كابتشينو كبير', category: 'قهوة ساخنة', price: 16, stock: 999, sku: 'CFE-002', imageUrl: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&q=80&w=400' },
  { name: 'لاتيه بارد', category: 'مشروبات باردة', price: 18, stock: 999, sku: 'CFE-003', imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=400' },
  { name: 'سبانيش لاتيه بارد', category: 'مشروبات باردة', price: 22, stock: 999, sku: 'CFE-004', imageUrl: 'https://images.unsplash.com/photo-1559496417-e7f20bc24b1e?auto=format&fit=crop&q=80&w=400' },
  { name: 'كرواسون زبدة', category: 'مخبوزات', price: 12, stock: 20, sku: 'CFE-005', imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&q=80&w=400' },
  { name: 'كيكة الشوكولاتة', category: 'حلويات', price: 15, stock: 12, sku: 'CFE-006', imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&q=80&w=400' },
  { name: 'شاي أخضر بالنعناع', category: 'شاي', price: 10, stock: 999, sku: 'CFE-007', imageUrl: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&q=80&w=400' },
];

const techProducts = [
  { name: 'ماوس لاسلكي لوجيتك', category: 'إكسسوارات', price: 120, stock: 25, sku: 'TEC-001', imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=400' },
  { name: 'لوحة مفاتيح ميكانيكية', category: 'إكسسوارات', price: 450, stock: 15, sku: 'TEC-002', imageUrl: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&q=80&w=400' },
  { name: 'سماعة شاومي لاسلكية', category: 'صوتيات', price: 180, stock: 30, sku: 'TEC-003', imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=400' },
  { name: 'شاحن أيفون سريع (20 واط)', category: 'شواحن', price: 95, stock: 50, sku: 'TEC-004', imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&q=80&w=400' },
  { name: 'جهاز راوتر تي بي لينك', category: 'شبكات', price: 290, stock: 10, sku: 'TEC-005', imageUrl: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&q=80&w=400' },
  { name: 'حافظة لابتوب (15 بوصة)', category: 'حقائب', price: 85, stock: 20, sku: 'TEC-006', imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400' },
];

export async function seedGroceryProducts(companyId: string) {
  const productsRef = collection(db, 'products');
  
  // Check if we already have seeded products (any of our prefixes)
  const q = query(productsRef, 
    where('companyId', '==', companyId), 
    where('sku', '>=', 'GRC-'), 
    where('sku', '<=', 'TEC-\uf8ff')
  );
  const snapshot = await getDocs(q);
  
  if (snapshot.size > 0) return; // Already seeded

  const allProducts = [...groceryProducts, ...cafeProducts, ...techProducts];

  for (const product of allProducts) {
    await addDoc(productsRef, {
      ...product,
      companyId,
      taxRate: 15,
      createdAt: serverTimestamp()
    });
  }
}
