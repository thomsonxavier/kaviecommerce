import { Product } from "../store/useStore";

export const products: Product[] = [
  // Shampoos
  {
    id: "shampoo-aloe-vera",
    name: "Aloe Vera Shampoo",
    category: "Personal Care",
    type: "Shampoo",
    sizes: [
      { value: "200ml", price: 199 },
      { value: "400ml", price: 349 },
    ],
    description:
      "Gentle cleansing shampoo enriched with pure aloe vera extract. Nourishes and strengthens hair while maintaining natural moisture balance.",
    ingredients: [
      "Aloe Vera Extract",
      "Coconut Oil",
      "Vitamin E",
      "Natural Surfactants",
      "Essential Oils",
    ],
  },
  {
    id: "shampoo-milk-protein",
    name: "Milk Protein Shampoo",
    category: "Personal Care",
    type: "Shampoo",
    sizes: [
      { value: "200ml", price: 219 },
      { value: "400ml", price: 389 },
    ],
    description:
      "Rich milk protein formula that deeply nourishes and repairs damaged hair. Provides shine and smoothness with every wash.",
    ingredients: [
      "Milk Protein",
      "Keratin",
      "Argan Oil",
      "Natural Conditioners",
      "Vitamin B5",
    ],
  },
  {
    id: "shampoo-shikakai",
    name: "Shikakai Shampoo",
    category: "Personal Care",
    type: "Shampoo",
    sizes: [
      { value: "200ml", price: 189 },
      { value: "400ml", price: 329 },
    ],
    description:
      "Traditional shikakai-based shampoo for natural hair care. Promotes hair growth and prevents dandruff naturally.",
    ingredients: [
      "Shikakai Powder",
      "Amla Extract",
      "Reetha",
      "Neem Oil",
      "Hibiscus Extract",
    ],
  },
  {
    id: "shampoo-onion",
    name: "Onion Shampoo",
    category: "Personal Care",
    type: "Shampoo",
    sizes: [
      { value: "200ml", price: 229 },
      { value: "400ml", price: 399 },
    ],
    description:
      "Enriched with red onion extract to reduce hair fall and promote healthy hair growth. Strengthens hair from roots to tips.",
    ingredients: [
      "Red Onion Extract",
      "Biotin",
      "Caffeine",
      "Saw Palmetto",
      "Vitamin C",
    ],
  },

  // Sanitary Napkins
  {
    id: "napkin-xl-10",
    name: "Organic Sanitary Napkins - XL (10 pcs)",
    category: "Personal Care",
    type: "Sanitary Napkin",
    sizes: [{ value: "10 pcs", price: 99 }],
    description:
      "100% organic cotton sanitary napkins. Chemical-free, soft, and highly absorbent. Perfect for sensitive skin.",
    ingredients: [
      "Organic Cotton",
      "Biodegradable Materials",
      "Natural Absorbent Core",
    ],
  },
  {
    id: "napkin-xl-30",
    name: "Organic Sanitary Napkins - XL (30 pcs)",
    category: "Personal Care",
    type: "Sanitary Napkin",
    sizes: [{ value: "30 pcs", price: 279 }],
    description:
      "Value pack of 100% organic cotton sanitary napkins. Chemical-free, soft, and highly absorbent.",
    ingredients: [
      "Organic Cotton",
      "Biodegradable Materials",
      "Natural Absorbent Core",
    ],
  },
  {
    id: "napkin-xxl-10",
    name: "Organic Sanitary Napkins - XXL (10 pcs)",
    category: "Personal Care",
    type: "Sanitary Napkin",
    sizes: [{ value: "10 pcs", price: 119 }],
    description:
      "Extra-large 100% organic cotton sanitary napkins for overnight protection. Chemical-free and ultra-absorbent.",
    ingredients: [
      "Organic Cotton",
      "Biodegradable Materials",
      "Natural Absorbent Core",
    ],
  },
  {
    id: "napkin-xxl-30",
    name: "Organic Sanitary Napkins - XXL (30 pcs)",
    category: "Personal Care",
    type: "Sanitary Napkin",
    sizes: [{ value: "30 pcs", price: 329 }],
    description:
      "Value pack of extra-large 100% organic cotton sanitary napkins. Perfect for overnight use.",
    ingredients: [
      "Organic Cotton",
      "Biodegradable Materials",
      "Natural Absorbent Core",
    ],
  },

  // Detergents
  {
    id: "detergent-1l",
    name: "Organic Liquid Detergent - Natural Wash (1 Ltr)",
    category: "Home Care",
    type: "Detergent",
    sizes: [{ value: "1 Ltr", price: 249 }],
    description:
      "Plant-based liquid detergent for gentle yet effective cleaning. Safe for all fabrics and sensitive skin.",
    ingredients: [
      "Plant-Based Surfactants",
      "Natural Enzymes",
      "Essential Oil Fragrance",
      "Biodegradable Formula",
    ],
  },
  {
    id: "detergent-3l",
    name: "Organic Liquid Detergent - Natural Wash (3 Ltr)",
    category: "Home Care",
    type: "Detergent",
    sizes: [{ value: "3 Ltr", price: 649 }],
    description:
      "Economy pack of plant-based liquid detergent. Eco-friendly and powerful cleaning for the whole family.",
    ingredients: [
      "Plant-Based Surfactants",
      "Natural Enzymes",
      "Essential Oil Fragrance",
      "Biodegradable Formula",
    ],
  },
  {
    id: "detergent-5l",
    name: "Organic Liquid Detergent - Natural Wash (5 Ltr)",
    category: "Home Care",
    type: "Detergent",
    sizes: [{ value: "5 Ltr", price: 999 }],
    description:
      "Family-size pack of organic liquid detergent. Best value for money with maximum cleaning power.",
    ingredients: [
      "Plant-Based Surfactants",
      "Natural Enzymes",
      "Essential Oil Fragrance",
      "Biodegradable Formula",
    ],
  },
];
