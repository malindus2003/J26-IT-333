import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Plus, 
  Clock, 
  ChefHat, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Layers, 
  Sparkles, 
  Flame, 
  Utensils, 
  RefreshCw, 
  X, 
  Check, 
  DollarSign, 
  TrendingUp, 
  AlertCircle,
  ShieldCheck,
  PackageCheck,
  Armchair,
  CheckCheck,
  Users,
  Receipt,
  Search,
  Filter,
  FileText,
  Eye,
  Printer,
  CreditCard,
  Wallet,
  QrCode,
  Calendar,
  Download,
  BarChart3,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
const DEFAULT_MENU = [
  {
    id: "menu-01",
    name: "Sri Lankan Chicken Kottu Roti",
    category: "Main Course",
    price_lkr: 1450.0,
    prep_time_mins: 8,
    station_id: "station-1",
    station_name: "Hot Wok & Kottu Station",
    image_url: "/images/dishes/dish_1.jpg",
    description: "Flaky godamba roti shredded with spiced fresh chicken breast, carrots, leeks, and egg.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Fresh Chicken Breast (Chilled)", category: "Meat", required_kg: 0.30 },
      { ingredient_name: "Hydroponic Romaine Lettuce (Crisp)", category: "Vegetables", required_kg: 0.10 }
    ],
    stock_details: [
      { ingredient: "Fresh Chicken Breast (Chilled)", required_kg: 0.30, is_spoilage_risk: false },
      { ingredient: "Hydroponic Romaine Lettuce (Crisp)", required_kg: 0.10, is_spoilage_risk: true }
    ]
  },
  {
    id: "menu-02",
    name: "Grilled Atlantic Salmon Steak",
    category: "Seafood",
    price_lkr: 2850.0,
    prep_time_mins: 14,
    station_id: "station-3",
    station_name: "Grill & Seafood Station",
    image_url: "/images/dishes/dish_2.jpg",
    description: "Pan-seared Atlantic salmon fillet served with garlic herb butter and fresh garden greens.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Fresh Atlantic Salmon Fillet", category: "Fish", required_kg: 0.35 },
      { ingredient_name: "Hydroponic Romaine Lettuce (Crisp)", category: "Vegetables", required_kg: 0.10 }
    ],
    stock_details: [
      { ingredient: "Fresh Atlantic Salmon Fillet", required_kg: 0.35, is_spoilage_risk: true },
      { ingredient: "Hydroponic Romaine Lettuce (Crisp)", required_kg: 0.10, is_spoilage_risk: false }
    ]
  },
  {
    id: "menu-03",
    name: "Belgian Berry & Banana Waffle",
    category: "Dessert & Pastry",
    price_lkr: 1150.0,
    prep_time_mins: 6,
    station_id: "station-1",
    station_name: "Hot Wok & Kottu Station",
    image_url: "/images/dishes/dish_3.jpg",
    description: "Crisp Belgian waffle topped with sliced ripe bananas, wild berries, honey, and fresh whipped cream.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Cavendish Ripe Bananas (Crate)", category: "Fruits", required_kg: 0.25 },
      { ingredient_name: "Fresh Farm Strawberries (Punnet)", category: "Fruits", required_kg: 0.10 },
      { ingredient_name: "Pasteurized Whole Milk (Bulk)", category: "Dairy", required_kg: 0.08 }
    ],
    stock_details: [
      { ingredient: "Cavendish Ripe Bananas (Crate)", required_kg: 0.25, is_spoilage_risk: true },
      { ingredient: "Fresh Farm Strawberries (Punnet)", required_kg: 0.10, is_spoilage_risk: true }
    ]
  },
  {
    id: "menu-04",
    name: "Artisan Garden Harvest Salad",
    category: "Healthy & Salads",
    price_lkr: 980.0,
    prep_time_mins: 4,
    station_id: "station-4",
    station_name: "Salad & Cold Prep Station",
    image_url: "/images/dishes/dish_4.jpg",
    description: "Fresh romaine lettuce, baby spinach leaves, ripe vine tomatoes, and aged cheese shavings.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Hydroponic Romaine Lettuce (Crisp)", category: "Vegetables", required_kg: 0.20 },
      { ingredient_name: "Baby Spinach Leaves (Crisp)", category: "Vegetables", required_kg: 0.10 },
      { ingredient_name: "Aged Cheddar & Mozzarella Blocks", category: "Dairy", required_kg: 0.05 }
    ],
    stock_details: [
      { ingredient: "Hydroponic Romaine Lettuce (Crisp)", required_kg: 0.20, is_spoilage_risk: false },
      { ingredient: "Baby Spinach Leaves (Crisp)", required_kg: 0.10, is_spoilage_risk: true }
    ]
  },
  {
    id: "menu-05",
    name: "Prime Beef Sirloin Medallion",
    category: "Main Course",
    price_lkr: 3200.0,
    prep_time_mins: 15,
    station_id: "station-3",
    station_name: "Grill & Seafood Station",
    image_url: "/images/dishes/dish_5.jpg",
    description: "Chargrilled prime grass-fed beef sirloin with roasted tomatoes, red wine reduction, and herbs.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Prime Beef Sirloin (Vac-Pack)", category: "Meat", required_kg: 0.35 },
      { ingredient_name: "Hydroponic Romaine Lettuce (Crisp)", category: "Vegetables", required_kg: 0.08 }
    ],
    stock_details: [
      { ingredient: "Prime Beef Sirloin (Vac-Pack)", required_kg: 0.35, is_spoilage_risk: false }
    ]
  },
  {
    id: "menu-06",
    name: "Fresh Berry Smoothie Bowl",
    category: "Beverages & Breakfast",
    price_lkr: 850.0,
    prep_time_mins: 5,
    station_id: "station-4",
    station_name: "Salad & Cold Prep Station",
    image_url: "/images/dishes/dish_6.jpg",
    description: "Blended ripe bananas and fresh strawberries with pasteurized whole milk, chia seeds, and granola.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Cavendish Ripe Bananas (Crate)", category: "Fruits", required_kg: 0.20 },
      { ingredient_name: "Fresh Farm Strawberries (Punnet)", category: "Fruits", required_kg: 0.15 },
      { ingredient_name: "Pasteurized Whole Milk (Bulk)", category: "Dairy", required_kg: 0.15 }
    ],
    stock_details: [
      { ingredient: "Cavendish Ripe Bananas (Crate)", required_kg: 0.20, is_spoilage_risk: true },
      { ingredient: "Fresh Farm Strawberries (Punnet)", required_kg: 0.15, is_spoilage_risk: true }
    ]
  },
  {
    id: "menu-07",
    name: "Seafood Nasi Goreng & Calamari",
    category: "Seafood",
    price_lkr: 1950.0,
    prep_time_mins: 9,
    station_id: "station-1",
    station_name: "Hot Wok & Kottu Station",
    image_url: "/images/dishes/dish_7.jpg",
    description: "Wok-fried jasmine rice with calamari rings, prawns, chili sambal, fried egg, and prawn crackers.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Fresh Atlantic Salmon Fillet", category: "Fish", required_kg: 0.20 },
      { ingredient_name: "Baby Spinach Leaves (Crisp)", category: "Vegetables", required_kg: 0.08 }
    ],
    stock_details: [
      { ingredient: "Fresh Atlantic Salmon Fillet", required_kg: 0.20, is_spoilage_risk: true }
    ]
  },
  {
    id: "menu-08",
    name: "Crispy Devilled Chicken & Fragrant Rice",
    category: "Main Course",
    price_lkr: 1650.0,
    prep_time_mins: 11,
    station_id: "station-1",
    station_name: "Hot Wok & Kottu Station",
    image_url: "/images/dishes/dish_8.jpg",
    description: "Crispy battered chicken tossed in sweet spicy capsicum, tomato gravy, and served with basmati rice.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Fresh Chicken Breast (Chilled)", category: "Meat", required_kg: 0.35 },
      { ingredient_name: "Hydroponic Romaine Lettuce (Crisp)", category: "Vegetables", required_kg: 0.10 }
    ],
    stock_details: [
      { ingredient: "Fresh Chicken Breast (Chilled)", required_kg: 0.35, is_spoilage_risk: false }
    ]
  },
  {
    id: "menu-09",
    name: "Garlic Butter Jumbo King Prawns",
    category: "Seafood",
    price_lkr: 2650.0,
    prep_time_mins: 12,
    station_id: "station-3",
    station_name: "Grill & Seafood Station",
    image_url: "/images/dishes/dish_9.jpg",
    description: "Succulent grilled sea prawns tossed in roasted garlic butter, parsley, and toasted garlic sourdough.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Fresh Atlantic Salmon Fillet", category: "Fish", required_kg: 0.30 },
      { ingredient_name: "Hydroponic Romaine Lettuce (Crisp)", category: "Vegetables", required_kg: 0.10 }
    ],
    stock_details: [
      { ingredient: "Fresh Atlantic Salmon Fillet", required_kg: 0.30, is_spoilage_risk: true }
    ]
  },
  {
    id: "menu-10",
    name: "Stone-Baked Artisan Pizza",
    category: "Main Course",
    price_lkr: 2100.0,
    prep_time_mins: 14,
    station_id: "station-1",
    station_name: "Hot Wok & Kottu Station",
    image_url: "/images/dishes/dish_10.jpg",
    description: "Handcrafted thin crust dough topped with crushed San Marzano tomatoes, fresh mozzarella, and basil.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Aged Cheddar & Mozzarella Blocks", category: "Dairy", required_kg: 0.20 },
      { ingredient_name: "Hydroponic Romaine Lettuce (Crisp)", category: "Vegetables", required_kg: 0.05 }
    ],
    stock_details: [
      { ingredient: "Aged Cheddar & Mozzarella Blocks", required_kg: 0.20, is_spoilage_risk: false }
    ]
  },
  {
    id: "menu-11",
    name: "Mediterranean Greek Feta Salad",
    category: "Healthy & Salads",
    price_lkr: 1250.0,
    prep_time_mins: 5,
    station_id: "station-4",
    station_name: "Salad & Cold Prep Station",
    image_url: "/images/dishes/dish_11.jpg",
    description: "Vine-ripened tomatoes, crisp cucumbers, Kalamata olives, and creamy feta cheese drizzled with extra virgin olive oil.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Hydroponic Romaine Lettuce (Crisp)", category: "Vegetables", required_kg: 0.20 },
      { ingredient_name: "Aged Cheddar & Mozzarella Blocks", category: "Dairy", required_kg: 0.10 }
    ],
    stock_details: [
      { ingredient: "Hydroponic Romaine Lettuce (Crisp)", required_kg: 0.20, is_spoilage_risk: false }
    ]
  },
  {
    id: "menu-12",
    name: "Iced Passionfruit & Lime Cooler",
    category: "Beverages & Breakfast",
    price_lkr: 650.0,
    prep_time_mins: 3,
    station_id: "station-4",
    station_name: "Salad & Cold Prep Station",
    image_url: "/images/dishes/dish_12.jpg",
    description: "Refreshing fresh passionfruit pulp with muddled garden mint, sparkling soda, and crushed ice.",
    in_stock: true,
    recipe_bom: [
      { ingredient_name: "Cavendish Ripe Bananas (Crate)", category: "Fruits", required_kg: 0.10 },
      { ingredient_name: "Fresh Farm Strawberries (Punnet)", category: "Fruits", required_kg: 0.05 }
    ],
    stock_details: [
      { ingredient: "Fresh Farm Strawberries (Punnet)", required_kg: 0.05, is_spoilage_risk: true }
    ]
  }
];

const DEFAULT_TABLES = [
  { table_no: "Table 01", capacity: 2, status: "available", current_order_id: null, occupied_since: null },
  { table_no: "Table 02", capacity: 4, status: "dining", current_order_id: "ORD-1080", occupied_since: "12:25" },
  { table_no: "Table 03", capacity: 2, status: "available", current_order_id: null, occupied_since: null },
  { table_no: "Table 04", capacity: 4, status: "in_prep", current_order_id: "ORD-1081", occupied_since: "12:54" },
  { table_no: "Table 05", capacity: 6, status: "available", current_order_id: null, occupied_since: null },
  { table_no: "Table 06", capacity: 4, status: "available", current_order_id: null, occupied_since: null },
  { table_no: "Table 07", capacity: 2, status: "available", current_order_id: null, occupied_since: null },
  { table_no: "Table 08", capacity: 8, status: "available", current_order_id: null, occupied_since: null },
  { table_no: "Table 09", capacity: 4, status: "available", current_order_id: null, occupied_since: null },
  { table_no: "Table 10", capacity: 2, status: "available", current_order_id: null, occupied_since: null },
  { table_no: "Table 11", capacity: 4, status: "in_prep", current_order_id: "ORD-1082", occupied_since: "12:50" },
  { table_no: "Table 12", capacity: 6, status: "available", current_order_id: null, occupied_since: null }
];

const DEFAULT_ORDERS = [
  {
    id: "ORD-1081",
    order_number: 81,
    table_no: "Table 04",
    order_type: "Dine-In",
    items: [
      { menu_id: "menu-01", name: "Sri Lankan Chicken Kottu Roti", quantity: 2, unit_price: 1450.0 },
      { menu_id: "menu-06", name: "Fresh Berry Smoothie Bowl", quantity: 1, unit_price: 850.0 }
    ],
    total_amount_lkr: 3750.0,
    status: "in_prep",
    table_status: "occupied",
    station_id: "station-1",
    station_name: "Hot Wok & Kottu Station",
    created_at: "12:54:10",
    elapsed_mins: 6,
    target_prep_mins: 8,
    ingredients_deducted: [
      { item: "Fresh Chicken Breast (Chilled)", amount_kg: 0.60, batch: "BAT-2026-CK88" },
      { item: "Cavendish Ripe Bananas (Crate)", amount_kg: 0.20, batch: "BAT-2026-BN12 (Low RSL)" },
      { item: "Fresh Farm Strawberries (Punnet)", amount_kg: 0.15, batch: "BAT-2026-SB04" }
    ],
    customer_note: "Extra spicy kottu with mild gravy on the side."
  },
  {
    id: "ORD-1082",
    order_number: 82,
    table_no: "Table 11",
    order_type: "Dine-In",
    items: [
      { menu_id: "menu-02", name: "Grilled Atlantic Salmon Steak", quantity: 1, unit_price: 2850.0 },
      { menu_id: "menu-04", name: "Artisan Garden Harvest Salad", quantity: 1, unit_price: 980.0 }
    ],
    total_amount_lkr: 3830.0,
    status: "in_prep",
    table_status: "occupied",
    station_id: "station-3",
    station_name: "Grill & Seafood Station",
    created_at: "12:50:00",
    elapsed_mins: 10,
    target_prep_mins: 14,
    ingredients_deducted: [
      { item: "Fresh Atlantic Salmon Fillet", amount_kg: 0.35, batch: "BAT-2026-SF02" },
      { item: "Hydroponic Romaine Lettuce (Crisp)", amount_kg: 0.30, batch: "BAT-2026-VG44" }
    ],
    customer_note: "Medium rare salmon, dressing on the side."
  },
  {
    id: "ORD-1083",
    order_number: 83,
    table_no: "Takeout #TK-14",
    order_type: "Takeout",
    items: [
      { menu_id: "menu-03", name: "Belgian Berry & Banana Waffle", quantity: 2, unit_price: 1150.0 }
    ],
    total_amount_lkr: 2300.0,
    status: "ready",
    table_status: "not_applicable",
    station_id: "station-1",
    station_name: "Hot Wok & Kottu Station",
    created_at: "12:42:15",
    elapsed_mins: 18,
    target_prep_mins: 6,
    ingredients_deducted: [
      { item: "Cavendish Ripe Bananas (Crate)", amount_kg: 0.50, batch: "BAT-2026-BN12 (Low RSL)" },
      { item: "Fresh Farm Strawberries (Punnet)", amount_kg: 0.20, batch: "BAT-2026-SB04" }
    ],
    customer_note: "Pack syrup separately in takeaway box."
  },
  {
    id: "ORD-1084",
    order_number: 84,
    table_no: "Table 06",
    order_type: "Dine-In",
    items: [
      { menu_id: "menu-07", name: "Seafood Nasi Goreng & Calamari", quantity: 1, unit_price: 1950.0 },
      { menu_id: "menu-12", name: "Iced Passionfruit & Lime Cooler", quantity: 2, unit_price: 650.0 }
    ],
    total_amount_lkr: 3250.0,
    status: "pending",
    table_status: "occupied",
    station_id: "station-1",
    station_name: "Hot Wok & Kottu Station",
    created_at: "13:00:20",
    elapsed_mins: 1,
    target_prep_mins: 9,
    ingredients_deducted: [
      { item: "Fresh Atlantic Salmon Fillet", amount_kg: 0.20, batch: "BAT-2026-SF02" },
      { item: "Fresh Farm Strawberries (Punnet)", amount_kg: 0.10, batch: "BAT-2026-SB04" }
    ],
    customer_note: "Less spicy sambal, extra crushed ice."
  },
  {
    id: "ORD-1080",
    order_number: 80,
    table_no: "Table 02",
    order_type: "Dine-In",
    items: [
      { menu_id: "menu-05", name: "Prime Beef Sirloin Medallion", quantity: 1, unit_price: 3200.0 }
    ],
    total_amount_lkr: 3200.0,
    status: "completed",
    table_status: "dining",
    station_id: "station-3",
    station_name: "Grill & Seafood Station",
    created_at: "12:25:00",
    elapsed_mins: 35,
    target_prep_mins: 15,
    ingredients_deducted: [
      { item: "Prime Beef Sirloin (Vac-Pack)", amount_kg: 0.35, batch: "BAT-2026-BF09" }
    ],
    customer_note: "Served. Customers currently dining."
  }
];

const DEFAULT_STATS = {
  total_orders_today: 48,
  total_revenue_lkr: 146800,
  active_kitchen_tickets: 4,
  in_prep_count: 2,
  ready_for_pickup: 1,
  completed_count: 45,
  occupied_tables_count: 3,
  available_tables_count: 9,
  total_tables: 12,
  occupancy_rate_percent: 25.0,
  fifo_waste_prevented_kg: 18.6
};

const DEFAULT_DAILY_SALES = {
  period_days: 7,
  total_period_revenue_lkr: 986400,
  total_period_orders: 342,
  avg_daily_revenue_lkr: 140914,
  history: [
    { date: "2026-09-03", day_name: "Today", formatted_date: "03 Sep", revenue_lkr: 146800, order_count: 48, fifo_waste_saved_kg: 18.6 },
    { date: "2026-09-02", day_name: "Wed", formatted_date: "02 Sep", revenue_lkr: 138500, order_count: 45, fifo_waste_saved_kg: 16.4 },
    { date: "2026-09-01", day_name: "Tue", formatted_date: "01 Sep", revenue_lkr: 129000, order_count: 42, fifo_waste_saved_kg: 15.1 },
    { date: "2026-08-31", day_name: "Mon", formatted_date: "31 Aug", revenue_lkr: 118400, order_count: 38, fifo_waste_saved_kg: 14.2 },
    { date: "2026-08-30", day_name: "Sun", formatted_date: "30 Aug", revenue_lkr: 165200, order_count: 56, fifo_waste_saved_kg: 22.8 },
    { date: "2026-08-29", day_name: "Sat", formatted_date: "29 Aug", revenue_lkr: 158900, order_count: 54, fifo_waste_saved_kg: 21.3 },
    { date: "2026-08-28", day_name: "Fri", formatted_date: "28 Aug", revenue_lkr: 129600, order_count: 41, fifo_waste_saved_kg: 15.9 }
  ]
};

export default function OrderManagementDashboard({ onRefresh, isDarkMode, currentRole = 'admin', viewMode = 'all' }) {
  const isStaff = currentRole === 'staff';
  const isCashier = currentRole === 'cashier';

  const [menu, setMenu] = useState(DEFAULT_MENU);
  const [orders, setOrders] = useState(DEFAULT_ORDERS);
  const [tables, setTables] = useState(DEFAULT_TABLES);
  const [stats, setStats] = useState(DEFAULT_STATS);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showNewOrderModal, setShowNewOrderModal] = useState(false);
  
  // Single-Page Sub-View State (when in Admin mode): 'pos_menu' | 'tables_map' | 'kds' | 'orders_ledger'
  const [adminActiveTab, setAdminActiveTab] = useState(
    viewMode !== 'all' ? viewMode : (isCashier ? 'pos_menu' : isStaff ? 'kds' : 'pos_menu')
  );

  // Sync with viewMode prop when it changes
  useEffect(() => {
    if (viewMode !== 'all') {
      setAdminActiveTab(viewMode);
    }
  }, [viewMode]);

  // History Search & Filter State
  const [historySearch, setHistorySearch] = useState("");
  const [historyStatusFilter, setHistoryStatusFilter] = useState("all");
  const [selectedReceiptOrder, setSelectedReceiptOrder] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  // Past Days Sales Analytics State
  const [dailySalesData, setDailySalesData] = useState(DEFAULT_DAILY_SALES);
  const [selectedDaysRange, setSelectedDaysRange] = useState(7);
  const [showHistoryAnalytics, setShowHistoryAnalytics] = useState(true);
  const [filterDate, setFilterDate] = useState(null);

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!orders || orders.length === 0) return;
    const headers = ["Order Number", "Order ID", "Table", "Channel", "Time", "Status", "Items", "Total (LKR)"];
    const rows = orders.map(o => [
      `#${o.order_number}`,
      o.id,
      o.table_no,
      o.order_type,
      o.created_at,
      o.status,
      o.items.map(i => `${i.quantity}x ${i.name}`).join('; '),
      o.total_amount_lkr
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.map(val => `"${val}"`).join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sales_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // New Order State
  const [selectedDish, setSelectedDish] = useState(null);
  const [additionalItems, setAdditionalItems] = useState([]);
  const [showAddItemSelector, setShowAddItemSelector] = useState(false);
  const [tableNumber, setTableNumber] = useState("Table 01");
  const [orderType, setOrderType] = useState("Dine-In");
  const [portionCount, setPortionCount] = useState(1);
  const [customerNote, setCustomerNote] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState(null);

  useEffect(() => {
    fetchOrderData();
  }, [selectedDaysRange]);

  const fetchOrderData = async () => {
    try {
      setLoading(true);
      const [menuRes, ordersRes, statsRes, tablesRes, dailySalesRes] = await Promise.all([
        axios.get("http://localhost:8000/api/orders/menu"),
        axios.get("http://localhost:8000/api/orders"),
        axios.get("http://localhost:8000/api/orders/stats"),
        axios.get("http://localhost:8000/api/orders/tables"),
        axios.get(`http://localhost:8000/api/orders/daily-sales?days=${selectedDaysRange}`).catch(() => ({ data: null }))
      ]);
      if (menuRes.data?.menu?.length > 0) setMenu(menuRes.data.menu);
      if (ordersRes.data?.orders?.length > 0) setOrders(ordersRes.data.orders);
      if (statsRes.data) setStats(statsRes.data);
      if (tablesRes.data?.tables?.length > 0) setTables(tablesRes.data.tables);
      if (dailySalesRes.data) {
        setDailySalesData(dailySalesRes.data);
      }
    } catch (err) {
      console.warn("Backend server not reachable on localhost:8000, using comprehensive built-in offline data:", err);
      setMenu(prev => (prev && prev.length > 0 ? prev : DEFAULT_MENU));
      setOrders(prev => (prev && prev.length > 0 ? prev : DEFAULT_ORDERS));
      setTables(prev => (prev && prev.length > 0 ? prev : DEFAULT_TABLES));
      setStats(prev => prev || DEFAULT_STATS);
      setDailySalesData(prev => prev || DEFAULT_DAILY_SALES);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedDish) return;

    try {
      setSubmittingOrder(true);
      
      const allItemsPayload = [
        { menu_id: selectedDish.id, quantity: Number(portionCount) },
        ...additionalItems.map(it => ({ menu_id: it.menu_id, quantity: Number(it.quantity) }))
      ];

      const payload = {
        table_no: orderType === 'Dine-In' ? tableNumber : `${orderType} #${Math.floor(10 + Math.random() * 90)}`,
        order_type: orderType,
        items: allItemsPayload,
        customer_note: customerNote
      };

      try {
        const res = await axios.post("http://localhost:8000/api/orders", payload);
        setOrderSuccessMessage(`Order #${res.data.order.order_number} placed for ${res.data.order.table_no}! Smart FIFO ingredients deducted.`);
      } catch (networkErr) {
        console.warn("Backend unavailable, placing order in local offline state:", networkErr);
        const newOrderNum = Math.floor(85 + Math.random() * 20);
        const newOrderObj = {
          id: `ORD-${1000 + newOrderNum}`,
          order_number: newOrderNum,
          table_no: payload.table_no,
          order_type: payload.order_type,
          items: allItemsPayload.map(it => {
            const mItem = menu.find(m => m.id === it.menu_id) || selectedDish;
            return {
              menu_id: it.menu_id,
              name: mItem?.name || "Dish",
              quantity: it.quantity,
              unit_price: mItem?.price_lkr || 1200
            };
          }),
          total_amount_lkr: (selectedDish.price_lkr * Number(portionCount)),
          status: "in_prep",
          table_status: "occupied",
          station_id: selectedDish.station_id || "station-1",
          station_name: selectedDish.station_name || "Hot Wok & Kottu Station",
          created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          elapsed_mins: 0,
          target_prep_mins: selectedDish.prep_time_mins || 10,
          ingredients_deducted: selectedDish.recipe_bom.map(b => ({
            item: b.ingredient_name,
            amount_kg: (b.required_kg * Number(portionCount)).toFixed(2),
            batch: "BAT-2026-FIFO (Low RSL)"
          })),
          customer_note: customerNote || "Standard preparation"
        };
        setOrders(prev => [newOrderObj, ...prev]);
        if (orderType === 'Dine-In') {
          setTables(prev => prev.map(t => t.table_no === tableNumber ? { ...t, status: 'in_prep', current_order_id: newOrderObj.id, occupied_since: "Just now" } : t));
        }
        setStats(prev => prev ? {
          ...prev,
          active_kitchen_tickets: prev.active_kitchen_tickets + 1,
          in_prep_count: prev.in_prep_count + 1,
          total_revenue_lkr: prev.total_revenue_lkr + (selectedDish.price_lkr * Number(portionCount))
        } : prev);
        setOrderSuccessMessage(`Order #${newOrderNum} placed for ${payload.table_no}! Smart FIFO ingredients deducted.`);
      }

      setShowNewOrderModal(false);
      setSelectedDish(null);
      setAdditionalItems([]);
      setCustomerNote("");
      setPortionCount(1);
      
      if (onRefresh) onRefresh();
      setTimeout(() => setOrderSuccessMessage(null), 6000);
    } catch (err) {
      console.error("Failed to submit order:", err);
    } finally {
      setSubmittingOrder(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await axios.patch(`http://localhost:8000/api/orders/${orderId}/status`, { status: newStatus });
      await fetchOrderData();
      if (onRefresh) onRefresh();
    } catch (err) {
      console.warn("Backend unavailable, updating order status in local state:", err);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    }
  };

  const handleFreeTable = async (tableNo) => {
    try {
      await axios.post(`http://localhost:8000/api/orders/tables/${encodeURIComponent(tableNo)}/free`);
      setOrderSuccessMessage(`${tableNo} is now cleared, sanitized & free for new guests!`);
      await fetchOrderData();
      if (onRefresh) onRefresh();
      setTimeout(() => setOrderSuccessMessage(null), 5000);
    } catch (err) {
      console.warn("Backend unavailable, clearing table in local state:", err);
      setTables(prev => prev.map(t => t.table_no === tableNo ? { ...t, status: 'available', current_order_id: null, occupied_since: null } : t));
      setOrderSuccessMessage(`${tableNo} is now cleared, sanitized & free for new guests!`);
      setTimeout(() => setOrderSuccessMessage(null), 5000);
    }
  };

  const filteredMenu = selectedCategory === "all"
    ? menu
    : menu.filter(m => m.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const inPrepOrders = orders.filter(o => o.status === 'in_prep');
  const readyOrders = orders.filter(o => o.status === 'ready');
  const completedOrders = orders.filter(o => o.status === 'completed');

  const availableTables = tables.filter(t => t.status === 'available');

  // Filtered recent orders for History Ledger
  const filteredHistoryOrders = orders.filter(ord => {
    const matchesSearch = 
      ord.id?.toLowerCase().includes(historySearch.toLowerCase()) ||
      ord.table_no?.toLowerCase().includes(historySearch.toLowerCase()) ||
      ord.items?.some(i => i.name.toLowerCase().includes(historySearch.toLowerCase()));
    
    const matchesStatus = historyStatusFilter === 'all' 
      ? true 
      : historyStatusFilter === 'active' 
      ? (ord.status === 'pending' || ord.status === 'in_prep' || ord.status === 'ready')
      : ord.status === historyStatusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderOrderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border border-blue-300 dark:border-blue-700">● New Pending</span>;
      case 'in_prep':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 animate-pulse">🔥 Cooking</span>;
      case 'ready':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">✓ Ready on Pass</span>;
      case 'completed':
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700">✓ Served & Paid</span>;
    }
  };

  // Determine current active single-page view
  const currentView = viewMode !== 'all' ? viewMode : adminActiveTab;

  return (
    <div className="space-y-6">
      
      {/* Header Banner with Real-time Operational Stats (Exclusively in Orders & Sales Ledger) */}
      {currentView === 'orders_ledger' && (
        <div className="glass-panel p-6 rounded-2xl relative overflow-hidden bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 flex items-center gap-1.5 shadow-sm">
                  <Receipt className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" /> Financial Sales Ledger & Billing
                </span>
                <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-bold">
                  • Real-Time Revenue, Table Capacity & In-Kitchen Metrics
                </span>
              </div>
              <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1 sm:mt-2">
                Recent Orders & Billing Audit Ledger
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-300 mt-1 font-medium max-w-2xl leading-relaxed">
                Complete historical sales audit ledger, daily revenue volume, and table turnover tracking with automated Smart FIFO cold storage ingredient deductions.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5">
              <button
                onClick={() => setShowHistoryAnalytics(!showHistoryAnalytics)}
                className={`px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold flex items-center gap-1.5 border transition-all ${
                  showHistoryAnalytics
                    ? 'bg-emerald-700 text-white border-emerald-800 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
                }`}
                title="Toggle Past Days Sales Analytics"
              >
                <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{showHistoryAnalytics ? 'Hide Trends' : 'Sales Trends'}</span>
              </button>

              <button
                onClick={handleExportCSV}
                className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-slate-900 hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all border border-slate-700"
                title="Export Sales Audit Ledger as CSV"
              >
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              <button
                onClick={fetchOrderData}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors border border-slate-300 dark:border-slate-700"
                title="Refresh Orders & Tables"
              >
                <RefreshCw className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Live Operational Metrics Ribbon */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-3 border-t border-[#e1eae4] dark:border-slate-800">
              <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Orders Placed</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-0.5">{stats.total_orders_today}</div>
                <span className="text-[9px] sm:text-[10px] text-emerald-700 dark:text-emerald-400 font-bold block truncate">~{stats.on_time_fulfillment_rate} on-time</span>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Table Capacity</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-0.5">
                  {tables.filter(t => t.status === 'available').length} <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">/ {tables.length}</span>
                </div>
                <span className="text-[9px] sm:text-[10px] text-amber-700 dark:text-amber-400 font-bold block truncate">
                  {tables.filter(t => t.status === 'dining' || t.status === 'in_prep').length} Occupied
                </span>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Kitchen Tickets</span>
                <div className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400 mt-0.5">{stats.active_kitchen_tickets}</div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">{stats.in_prep_count} cooking • {stats.ready_for_pickup} ready</span>
              </div>

              <div className="p-2.5 sm:p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700">
                <span className="text-[9px] sm:text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Daily Food Sales</span>
                <div className="text-xl sm:text-2xl font-black text-emerald-800 dark:text-emerald-400 mt-0.5 truncate">Rs. {stats.total_revenue_lkr.toLocaleString()}</div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 font-medium block truncate">Real-time tracked</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Notification Alert */}
      {orderSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-950 dark:text-emerald-200 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-700 dark:text-emerald-400 flex-shrink-0" />
            <span>{orderSuccessMessage}</span>
          </div>
          <button onClick={() => setOrderSuccessMessage(null)} className="text-emerald-800 dark:text-emerald-300 hover:text-emerald-950">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ADMIN SUB-VIEW SWITCHER (When in Admin Mode, choose between the 4 dedicated sub-pages) */}
      {viewMode === 'all' && !isCashier && !isStaff && (
        <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 p-1.5 sm:p-2 rounded-xl sm:rounded-2xl border border-[#d1ded5] dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar w-full">
            <button
              onClick={() => setAdminActiveTab('pos_menu')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminActiveTab === 'pos_menu'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-[#f0f5f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Utensils className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>POS Menu</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('tables_map')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminActiveTab === 'tables_map'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-[#f0f5f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Armchair className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Table Map</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('kds')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminActiveTab === 'kds'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-[#f0f5f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ChefHat className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>KDS Tickets</span>
            </button>

            <button
              onClick={() => setAdminActiveTab('orders_ledger')}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[11px] sm:text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminActiveTab === 'orders_ledger'
                  ? 'bg-emerald-700 text-white shadow-md shadow-emerald-700/20'
                  : 'bg-[#f0f5f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Receipt className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span>Sales Ledger</span>
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[9px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-black">
                {orders.length}
              </span>
            </button>
          </div>

          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold pr-2 hidden lg:inline">
            1 Single-Purpose Screen per View
          </span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE PAGE VIEW 1: POS MENU ITEM CATALOG & ORDER PLACEMENT               */}
      {/* ========================================================================= */}
      {currentView === 'pos_menu' && (
        <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 space-y-4 sm:space-y-5 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-[#e1eae4] dark:border-slate-800 pb-3 sm:pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Utensils className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                POS Food Menu & Recipe Ingredients (BOM)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Click any dish to inspect required cold storage ingredient batches or place customer orders
              </p>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
              {["all", "main", "seafood", "salad", "dessert", "beverage"].map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 sm:px-3.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-[#f0f5f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-[#d1ded5] dark:border-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Menu Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            {filteredMenu.map(dish => (
              <div
                key={dish.id}
                className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#f8faf9] dark:bg-slate-800/80 border border-[#d1ded5] dark:border-slate-700 flex flex-col justify-between transition-all hover:shadow-md group space-y-3"
              >
                <div>
                  <div className="w-full h-36 sm:h-40 rounded-xl overflow-hidden relative bg-slate-100 dark:bg-slate-950 border border-[#d1ded5] dark:border-slate-700 mb-2.5">
                    <img
                      src={dish.image_url}
                      alt={dish.name}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="100%" height="100%" fill="%23059669" fill-opacity="0.12"/><text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" font-size="48">🍽️</text><text x="50%" y="72%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" font-weight="bold" fill="%23334155">${encodeURIComponent(dish.name)}</text></svg>`;
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <span className={`absolute top-2 right-2 text-[10px] font-black px-2.5 py-0.5 rounded-full shadow ${
                      dish.in_stock ? 'bg-emerald-700 text-white' : 'bg-rose-600 text-white'
                    }`}>
                      {dish.in_stock ? "✓ In Stock" : "⚠️ Low Stock"}
                    </span>
                    <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded bg-black/70 text-white backdrop-blur-sm">
                      {dish.station_name.split('&')[0]}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1">{dish.name}</h4>
                    <span className="text-sm font-black text-emerald-800 dark:text-emerald-400 font-mono flex-shrink-0">
                      Rs. {dish.price_lkr}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 font-medium leading-relaxed">
                    {dish.description}
                  </p>

                  {/* Recipe Ingredient Breakdown */}
                  <div className="mt-3 pt-2.5 border-t border-[#e1eae4] dark:border-slate-700 space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Recipe Ingredients (BOM):</span>
                    {dish.stock_details?.map((st, i) => (
                      <div key={i} className="flex items-center justify-between text-[11px] font-medium gap-1">
                        <span className="text-slate-700 dark:text-slate-300 truncate">• {st.ingredient.split('(')[0]}</span>
                        <span className={`font-mono text-[10px] font-bold flex-shrink-0 ${st.is_spoilage_risk ? 'text-amber-700 dark:text-amber-400' : 'text-slate-500'}`}>
                          {st.required_kg}kg {st.is_spoilage_risk ? '(Low RSL)' : ''}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setSelectedDish(dish);
                      setShowNewOrderModal(true);
                    }}
                    className="w-full py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-102 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Order This Dish
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE PAGE VIEW 2: RESTAURANT FLOOR TABLE MAP & OCCUPANCY                */}
      {/* ========================================================================= */}
      {currentView === 'tables_map' && (
        <div className="glass-panel p-3.5 sm:p-6 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 space-y-4 sm:space-y-5 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e1eae4] dark:border-slate-800 pb-3 sm:pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Armchair className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                Restaurant Floor Table Map & Seating Status
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Live seating occupancy tracking: Click any dining table to clear & free it when guests depart
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs font-bold">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-emerald-500" /> Free ({availableTables.length})
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-amber-500 animate-pulse" /> Cooking ({tables.filter(t => t.status === 'in_prep').length})
              </span>
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <span className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-rose-500" /> Dining ({tables.filter(t => t.status === 'dining').length})
              </span>
            </div>
          </div>

          {/* 12-Table Expanded Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {tables.map(tbl => {
              const isAvailable = tbl.status === 'available';
              const isCooking = tbl.status === 'in_prep';
              const isDining = tbl.status === 'dining';

              return (
                <div
                  key={tbl.table_no}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between min-h-[140px] shadow-sm ${
                    isAvailable
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                      : isCooking
                      ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200'
                      : 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-800 text-rose-950 dark:text-rose-200'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-black">{tbl.table_no}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/80 dark:bg-black/40 border border-black/10 dark:border-white/10">
                        {tbl.capacity} Seats
                      </span>
                    </div>

                    {tbl.occupied_since && (
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="h-3 w-3" /> Since {tbl.occupied_since}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-black/5 dark:border-white/5">
                    {isAvailable ? (
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ready for Guests
                      </span>
                    ) : isCooking ? (
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Flame className="h-3.5 w-3.5 animate-pulse" /> Order Cooking
                      </span>
                    ) : (
                      <button
                        onClick={() => handleFreeTable(tbl.table_no)}
                        className="w-full py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md transition-colors flex items-center justify-center gap-1"
                        title="Click to clear & free table for next party"
                      >
                        <Armchair className="h-3.5 w-3.5" /> Free Table
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE PAGE VIEW 3: KITCHEN DISPLAY SYSTEM (KDS) TICKETS                  */}
      {/* ========================================================================= */}
      {currentView === 'kds' && (
        <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 space-y-4 shadow-sm animate-fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e1eae4] dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                Kitchen Display System (KDS) Live Tickets
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                {isStaff 
                  ? 'Incoming New Orders & Ongoing In-Prep Cooking Tickets (High-Focus View)' 
                  : 'Real-time kitchen ticket flow from intake to pass'}
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-[#f0f5f2] dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-[#d1ded5] dark:border-slate-700">
              {pendingOrders.length + inPrepOrders.length} Cooking / Incoming
            </span>
          </div>

          {/* Ticket Flow Grid (3-Column for Staff: Incoming -> Cooking -> Ready / 4-Column for Admin) */}
          <div className={`grid grid-cols-1 ${isStaff ? 'md:grid-cols-3 gap-5' : 'md:grid-cols-2 lg:grid-cols-4 gap-4'}`}>
            
            {/* Column 1: Pending (New Incoming Orders) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> New Incoming Orders ({pendingOrders.length})
                </span>
              </div>

              <div className="space-y-3">
                {pendingOrders.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-[#d1ded5] dark:border-slate-800 text-center text-xs text-slate-400 font-medium space-y-1">
                    <ChefHat className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p>No new pending orders</p>
                    <p className="text-[10px] text-slate-400">All incoming tickets have been started</p>
                  </div>
                ) : (
                  pendingOrders.map(ord => (
                    <div key={ord.id} className="p-4 rounded-xl bg-[#f8faf9] dark:bg-slate-800/90 border border-[#d1ded5] dark:border-slate-700 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between border-b border-[#e1eae4] dark:border-slate-700 pb-2">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white">#{ord.order_number} ({ord.table_no})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300">
                          {ord.created_at}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
                            <span>{it.quantity}x {it.name}</span>
                            <span className="text-slate-500 font-mono">Rs. {it.unit_price * it.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* FIFO Ingredients Breakdown */}
                      {ord.ingredients_deducted?.length > 0 && (
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[10px] space-y-1 text-emerald-950 dark:text-emerald-300">
                          <span className="font-bold flex items-center gap-1">
                            <PackageCheck className="h-3 w-3 text-emerald-600" /> Smart FIFO Batches Used:
                          </span>
                          {ord.ingredients_deducted.map((ing, i) => (
                            <div key={i} className="text-slate-600 dark:text-slate-400 font-medium">
                              • {ing.amount_kg}kg {ing.item.split('(')[0]} ({ing.batch})
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 border-t border-[#e1eae4] dark:border-slate-700 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-500">{ord.station_name.split('&')[0]}</span>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'in_prep')}
                          className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Flame className="h-3.5 w-3.5" /> Start Cooking
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Ongoing / In Prep (Cooking) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-pulse" /> Ongoing Cooking ({inPrepOrders.length})
                </span>
              </div>

              <div className="space-y-3">
                {inPrepOrders.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-[#d1ded5] dark:border-slate-800 text-center text-xs text-slate-400 font-medium space-y-1">
                    <Flame className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p>No tickets currently cooking</p>
                    <p className="text-[10px] text-slate-400">Select a new order from left to start cooking</p>
                  </div>
                ) : (
                  inPrepOrders.map(ord => (
                    <div key={ord.id} className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-700/60 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between border-b border-amber-200 dark:border-amber-800 pb-2">
                        <span className="font-extrabold text-sm text-amber-950 dark:text-amber-200">#{ord.order_number} ({ord.table_no})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {ord.elapsed_mins}m / {ord.target_prep_mins}m
                        </span>
                      </div>

                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="text-xs font-bold text-slate-900 dark:text-white">
                            {it.quantity}x {it.name}
                          </div>
                        ))}
                      </div>

                      {ord.customer_note && (
                        <p className="text-[10px] text-amber-900 dark:text-amber-300 italic bg-amber-100/60 dark:bg-amber-950/60 p-1.5 rounded">
                          "{ord.customer_note}"
                        </p>
                      )}

                      <div className="pt-2 border-t border-amber-200 dark:border-amber-800 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-amber-800 dark:text-amber-400">{ord.station_name}</span>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'ready')}
                          className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          <Check className="h-3.5 w-3.5" /> Mark Ready on Pass
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Ready for Pickup / Pass (Visible for BOTH Staff & Admin) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Ready for Pickup ({readyOrders.length})
                </span>
              </div>

              <div className="space-y-3">
                {readyOrders.length === 0 ? (
                  <div className="p-8 rounded-xl border border-dashed border-[#d1ded5] dark:border-slate-800 text-center text-xs text-slate-400 font-medium space-y-1">
                    <CheckCircle2 className="h-8 w-8 text-slate-300 dark:text-slate-700 mx-auto" />
                    <p>No plates waiting on pass</p>
                    <p className="text-[10px] text-slate-400">Plates will appear here once marked ready</p>
                  </div>
                ) : (
                  readyOrders.map(ord => (
                    <div key={ord.id} className="p-4 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/60 shadow-sm space-y-2.5">
                      <div className="flex items-center justify-between border-b border-emerald-200 dark:border-emerald-800 pb-2">
                        <span className="font-extrabold text-sm text-emerald-950 dark:text-emerald-200">#{ord.order_number} ({ord.table_no})</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200">
                          {ord.order_type}
                        </span>
                      </div>

                      <div className="space-y-1">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="text-xs font-bold text-slate-900 dark:text-white">
                            {it.quantity}x {it.name}
                          </div>
                        ))}
                      </div>

                      <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300">Rs. {ord.total_amount_lkr}</span>
                        <button
                          onClick={() => handleUpdateStatus(ord.id, 'completed')}
                          className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-black dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> Served
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 4: Completed Orders (Only visible for Admin/Cashier) */}
            {!isStaff && (
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-slate-400" /> Completed Orders ({completedOrders.length})
                  </span>
                </div>

                <div className="space-y-3">
                  {completedOrders.slice(0, 4).map(ord => {
                    const isDineIn = ord.order_type === 'Dine-In';
                    const isTableOccupied = ord.table_status === 'dining' || ord.table_status === 'occupied';

                    return (
                      <div key={ord.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-800 border border-[#d1ded5] dark:border-slate-700 shadow-sm space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-900 dark:text-white">#{ord.order_number} ({ord.table_no})</span>
                          <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                            <CheckCheck className="h-3 w-3" /> Served
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                          {ord.items.map(it => `${it.quantity}x ${it.name}`).join(', ')}
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-[#e1eae4] dark:border-slate-700 text-[10px]">
                          <span className="text-slate-500 font-mono font-bold">Rs. {ord.total_amount_lkr}</span>
                          
                          {isDineIn && (
                            isTableOccupied ? (
                              <button
                                onClick={() => handleFreeTable(ord.table_no)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                                title="Customers have finished and departed. Click to mark table free."
                              >
                                <Armchair className="h-3 w-3" /> Clear & Free Table
                              </button>
                            ) : (
                              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                ✓ Table Cleared
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SINGLE PAGE VIEW 4: RECENT ORDERS & SALES LEDGER TABLE                    */}
      {/* ========================================================================= */}
      {currentView === 'orders_ledger' && (
        <div className="glass-panel p-6 rounded-2xl bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 space-y-6 shadow-sm animate-fade-in">
          
          {/* Section 4.1: Historical Daily Sales & Revenue Performance Hub */}
          {showHistoryAnalytics && dailySalesData && (
            <div className="p-5 rounded-2xl bg-[#f4f8f5] dark:bg-slate-950 border border-[#d2e2d7] dark:border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dce9e0] dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-emerald-700 text-white shadow-sm">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                      Past Days Sales Trends & Revenue Analytics
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Historical day-by-day revenue breakdown, order counts, and top revenue generators
                    </p>
                  </div>
                </div>

                {/* Period Selector Tabs */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-[#d1ded5] dark:border-slate-800">
                  {[
                    { days: 7, label: 'Past 7 Days' },
                    { days: 14, label: 'Past 14 Days' },
                    { days: 30, label: 'Past 30 Days' }
                  ].map(p => (
                    <button
                      key={p.days}
                      onClick={() => setSelectedDaysRange(p.days)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        selectedDaysRange === p.days
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Period KPI Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#d7e5dc] dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Period Total Sales</span>
                  <div className="text-xl font-black text-emerald-800 dark:text-emerald-400 mt-0.5">
                    Rs. {dailySalesData.total_period_revenue_lkr.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">{selectedDaysRange} Days Cumulative</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#d7e5dc] dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Period Orders Fulfilled</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    {dailySalesData.total_period_orders.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">~{Math.round(dailySalesData.total_period_orders / selectedDaysRange)} orders/day avg</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#d7e5dc] dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Average Daily Revenue</span>
                  <div className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                    Rs. {dailySalesData.avg_daily_revenue_lkr.toLocaleString()}
                  </div>
                  <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold">Consistent Performance</span>
                </div>

                <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-[#d7e5dc] dark:border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Smart FIFO Waste Prevented</span>
                  <div className="text-xl font-black text-teal-700 dark:text-teal-400 mt-0.5">
                    {dailySalesData.history.reduce((a, b) => a + (b.fifo_waste_saved_kg || 0), 0).toFixed(1)} kg
                  </div>
                  <span className="text-[10px] text-slate-500 font-medium">Perishable stock saved</span>
                </div>
              </div>

              {/* Visual Daily Sales Bar Progress Chart */}
              <div className="space-y-2 pt-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                  Daily Revenue Performance & Order Breakdown ({selectedDaysRange} Days):
                </span>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
                  {dailySalesData.history.slice(0, selectedDaysRange).map((day, idx) => {
                    const maxRev = Math.max(...dailySalesData.history.map(d => d.revenue_lkr));
                    const barHeightPct = Math.round((day.revenue_lkr / maxRev) * 100);

                    return (
                      <div
                        key={day.date}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-[#d7e5dc] dark:border-slate-800 flex flex-col justify-between space-y-2 hover:border-emerald-500 transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-extrabold text-slate-900 dark:text-white">{day.day_name}</span>
                          <span className="text-[10px] text-slate-400">{day.formatted_date.split(' ')[0]} {day.formatted_date.split(' ')[1]}</span>
                        </div>

                        {/* Visual Revenue Bar */}
                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-700 h-full rounded-full transition-all duration-500"
                            style={{ width: `${barHeightPct}%` }}
                          />
                        </div>

                        <div className="space-y-0.5">
                          <div className="font-mono font-black text-xs text-emerald-800 dark:text-emerald-400">
                            Rs. {day.revenue_lkr.toLocaleString()}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between font-medium">
                            <span>{day.total_orders} orders</span>
                            <span className="text-[9px] text-emerald-700 dark:text-emerald-400 font-bold">{day.on_time_rate}</span>
                          </div>
                        </div>

                        <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1" title={day.top_selling_dish}>
                          🌟 {day.top_selling_dish}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* Section 4.2: Recent Orders & Sales Ledger Table */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e1eae4] dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Receipt className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                  Live Orders & Transaction Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Detailed record of placed orders, bill totals, smart FIFO batch allocations, and digital receipts
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
                  {filteredHistoryOrders.length} Transactions Listed
                </span>
              </div>
            </div>

          {/* Search & Status Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#f4f8f5] dark:bg-slate-800/80 p-3 rounded-xl border border-[#d7e5dc] dark:border-slate-700">
            {/* Search */}
            <div className="sm:col-span-6 relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order # (e.g. ORD-1081), Table, or Dish..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-[#c6d7cd] dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600 shadow-sm"
              />
            </div>

            {/* Status Filter */}
            <div className="sm:col-span-6 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: 'all', label: 'All Orders' },
                { id: 'active', label: 'In Kitchen' },
                { id: 'ready', label: 'Ready' },
                { id: 'completed', label: 'Completed' }
              ].map(st => (
                <button
                  key={st.id}
                  onClick={() => setHistoryStatusFilter(st.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
                    historyStatusFilter === st.id
                      ? 'bg-emerald-700 text-white shadow-sm'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 border border-[#d1ded5] dark:border-slate-700'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Orders History Table */}
          <div className="overflow-x-auto rounded-xl border border-[#d1ded5] dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <table className="w-full text-left text-xs text-slate-900 dark:text-slate-100">
              <thead className="bg-[#f0f5f2] dark:bg-slate-800 text-slate-800 dark:text-slate-200 uppercase font-bold border-b border-[#d1ded5] dark:border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Order Ref & Time</th>
                  <th className="py-3.5 px-4">Table / Channel</th>
                  <th className="py-3.5 px-4">Items Ordered</th>
                  <th className="py-3.5 px-4">Total Amount</th>
                  <th className="py-3.5 px-4">Order Status</th>
                  <th className="py-3.5 px-4">Smart FIFO Batches Deducted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e6ede8] dark:divide-slate-800">
                {filteredHistoryOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-slate-500 dark:text-slate-400 font-medium">
                      No matching orders found in ledger.
                    </td>
                  </tr>
                ) : (
                  filteredHistoryOrders.map((ord) => {
                    const isDineIn = ord.order_type === 'Dine-In';
                    const isTableOccupied = ord.table_status === 'dining' || ord.table_status === 'occupied';

                    return (
                      <tr key={ord.id} className="hover:bg-[#f9fbf9] dark:hover:bg-slate-800/60 transition-colors">
                        
                        {/* Order Number & Timestamp */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>#{ord.order_number}</span>
                            <span className="text-[10px] font-mono text-slate-400">({ord.id})</span>
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Placed at {ord.created_at}
                          </div>
                        </td>

                        {/* Table / Order Channel */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">{ord.table_no}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            {ord.order_type} • <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{ord.station_name.split('&')[0]}</span>
                          </div>
                        </td>

                        {/* Items Summary */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="space-y-0.5">
                            {ord.items.map((it, i) => (
                              <div key={i} className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {it.quantity}x {it.name}
                              </div>
                            ))}
                          </div>
                        </td>

                        {/* Total Amount in LKR */}
                        <td className="py-3.5 px-4 font-mono font-black text-sm text-emerald-800 dark:text-emerald-400">
                          Rs. {ord.total_amount_lkr.toLocaleString()}
                        </td>

                        {/* Order Status */}
                        <td className="py-3.5 px-4">
                          {renderOrderStatusBadge(ord.status)}
                        </td>

                        {/* Smart FIFO Deductions */}
                        <td className="py-3.5 px-4 max-w-xs">
                          {ord.ingredients_deducted?.length > 0 ? (
                            <div className="space-y-0.5 text-[11px]">
                              {ord.ingredients_deducted.map((ing, i) => (
                                <div key={i} className="text-slate-600 dark:text-slate-300 font-medium">
                                  • {ing.amount_kg}kg {ing.item.split('(')[0]} <span className="text-slate-400 font-mono text-[10px]">({ing.batch.split(' ')[0]})</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Standard Stock</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setSelectedReceiptOrder(ord)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all hover:scale-105"
                              title="Generate Customer Bill & Print Receipt"
                            >
                              <Printer className="h-3.5 w-3.5" />
                              <span>Bill & Print</span>
                            </button>

                            {isDineIn && isTableOccupied && (
                              <button
                                onClick={() => handleFreeTable(ord.table_no)}
                                className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold shadow-sm transition-colors"
                                title="Free Table"
                              >
                                Free Table
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PROFESSIONAL CUSTOMER BILLING & PRINTABLE INVOICE MODAL                   */}
      {/* ========================================================================= */}
      {selectedReceiptOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-fade-in max-h-[95vh] overflow-y-auto">
            
            {/* Modal Actions Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#e1eae4] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                  <Receipt className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white">Customer Invoice & Bill</h3>
                  <span className="text-[11px] text-slate-500 font-medium">Order #{selectedReceiptOrder.order_number} • POS Terminal</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintReceipt}
                  className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all hover:scale-105"
                  title="Print Customer Bill Slip"
                >
                  <Printer className="h-4 w-4" /> Print Bill
                </button>
                <button
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PRINTABLE THERMAL RECEIPT SLIP CONTAINER */}
            <div 
              id="printable-bill-slip"
              className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-dashed border-slate-300 dark:border-slate-800 shadow-inner space-y-4 font-mono text-slate-900 dark:text-slate-100"
            >
              {/* Restaurant Header */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300 dark:border-slate-800">
                <h4 className="font-black text-base uppercase tracking-wider text-slate-900 dark:text-white">SMART RESTAURANT</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-sans">
                  AI & IoT Cloud Kitchen • SLIIT Research Hub
                </p>
                <p className="text-[10px] text-slate-400 font-sans">
                  Tax / VAT Reg: LK-99384-2026 | Tel: +94 11 234 5678
                </p>
              </div>

              {/* Bill Meta Details */}
              <div className="grid grid-cols-2 text-[11px] gap-y-1 text-slate-600 dark:text-slate-400 border-b border-dashed border-slate-300 dark:border-slate-800 pb-3">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Bill / Invoice No:</span>
                  <span className="font-bold text-slate-900 dark:text-white">INV-{selectedReceiptOrder.order_number.toString().padStart(5, '0')}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Date & Time:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedReceiptOrder.created_at}</span>
                </div>
                <div className="mt-1">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Dining Table / Channel:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedReceiptOrder.table_no} ({selectedReceiptOrder.order_type})</span>
                </div>
                <div className="text-right mt-1">
                  <span className="text-slate-400 block text-[9px] uppercase font-sans">Station:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{selectedReceiptOrder.station_name.split('&')[0]}</span>
                </div>
              </div>

              {/* Itemized Table */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-bold text-[10px] uppercase text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-1">
                  <span>Item Description</span>
                  <span className="text-right">Amount (LKR)</span>
                </div>

                {selectedReceiptOrder.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-start text-xs font-medium">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{it.quantity}x {it.name}</span>
                      <span className="text-[10px] text-slate-400 block font-sans">@ Rs. {it.unit_price.toLocaleString()} each</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">
                      Rs. {(it.unit_price * it.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Bill Totals Summary */}
              <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-800 space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span>Rs. {selectedReceiptOrder.total_amount_lkr.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>Service Charge (Included):</span>
                  <span>Rs. 0.00</span>
                </div>
                <div className="flex justify-between text-slate-600 dark:text-slate-400 text-[11px]">
                  <span>Government VAT (0%):</span>
                  <span>Rs. 0.00</span>
                </div>

                <div className="pt-2 border-t border-slate-300 dark:border-slate-700 flex justify-between font-black text-base text-slate-900 dark:text-white">
                  <span>NET TOTAL:</span>
                  <span className="text-emerald-800 dark:text-emerald-400">Rs. {selectedReceiptOrder.total_amount_lkr.toLocaleString()}</span>
                </div>
              </div>

              {/* Payment Mode Selection */}
              <div className="pt-3 border-t border-dashed border-slate-300 dark:border-slate-800 space-y-2">
                <span className="text-[10px] uppercase font-bold text-slate-500 font-sans block">Payment Tendered Mode:</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'Cash', label: 'Cash', icon: <Wallet className="h-3.5 w-3.5" /> },
                    { id: 'Card', label: 'Credit Card', icon: <CreditCard className="h-3.5 w-3.5" /> },
                    { id: 'QR', label: 'QR / UPI', icon: <QrCode className="h-3.5 w-3.5" /> }
                  ].map(pm => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`p-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                        paymentMethod === pm.id
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      {pm.icon}
                      <span>{pm.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Smart FIFO Traceability Note */}
              {selectedReceiptOrder.ingredients_deducted?.length > 0 && (
                <div className="p-2.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-[10px] space-y-1 font-sans text-emerald-950 dark:text-emerald-300">
                  <span className="font-bold flex items-center gap-1">
                    <PackageCheck className="h-3 w-3 text-emerald-600" /> Smart FIFO Stock Allocation:
                  </span>
                  <p className="text-slate-600 dark:text-slate-400 font-mono text-[9px]">
                    {selectedReceiptOrder.ingredients_deducted.map(i => `${i.amount_kg}kg ${i.item.split('(')[0]} (${i.batch.split(' ')[0]})`).join(', ')}
                  </p>
                </div>
              )}

              {/* Footer Thank You Note */}
              <div className="text-center pt-2 text-[10px] text-slate-400 font-sans">
                <p>*** THANK YOU FOR DINING WITH US ***</p>
                <p className="text-[9px] mt-0.5">Automated Food Waste Prevention System Active</p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-[#e1eae4] dark:border-slate-800">
              <div className="flex items-center gap-2">
                {selectedReceiptOrder.order_type === 'Dine-In' && (selectedReceiptOrder.table_status === 'dining' || selectedReceiptOrder.table_status === 'occupied') && (
                  <button
                    onClick={() => {
                      handleFreeTable(selectedReceiptOrder.table_no);
                      setSelectedReceiptOrder(null);
                    }}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <Armchair className="h-3.5 w-3.5" /> Mark Paid & Free Table
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReceiptOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
                >
                  Close
                </button>
                <button
                  onClick={handlePrintReceipt}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-700/20 transition-all hover:scale-105"
                >
                  <Printer className="h-4 w-4" /> Print Receipt
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* PLACE NEW CUSTOMER ORDER MODAL                                            */}
      {/* ========================================================================= */}
      {showNewOrderModal && selectedDish && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-[#d1ded5] dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#e1eae4] dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-emerald-700 dark:text-emerald-400" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Place New Customer Order</h3>
              </div>
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="space-y-4 text-xs">
              
              {/* Selected Dish Card Summary */}
              <div className="p-3.5 rounded-xl bg-[#f8faf9] dark:bg-slate-800 border border-[#d1ded5] dark:border-slate-700 flex items-center gap-3">
                <img
                  src={selectedDish.image_url}
                  alt={selectedDish.name}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100%" height="100%" fill="%23059669" fill-opacity="0.12"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-size="28">🍽️</text></svg>`;
                  }}
                  className="h-14 w-14 rounded-lg object-cover flex-shrink-0"
                />
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{selectedDish.name}</h4>
                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-mono">
                    Rs. {selectedDish.price_lkr} • {selectedDish.station_name}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Order Channel</label>
                  <select
                    value={orderType}
                    onChange={(e) => setOrderType(e.target.value)}
                    className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600"
                  >
                    <option value="Dine-In">Dine-In (Select Table Below)</option>
                    <option value="Takeout">Takeaway / Takeout</option>
                    <option value="Delivery">Delivery Platform</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Selected Table</label>
                  <select
                    disabled={orderType !== 'Dine-In'}
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-bold focus:outline-none focus:border-emerald-600 disabled:opacity-50"
                  >
                    {tables.map(t => (
                      <option key={t.table_no} value={t.table_no}>
                        {t.table_no} ({t.status === 'available' ? '✓ Free' : 'Occupied'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Free Tables Quick Chips */}
              {orderType === 'Dine-In' && availableTables.length > 0 && (
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">Quick Select Available Free Tables:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {availableTables.map(tbl => (
                      <button
                        key={tbl.table_no}
                        type="button"
                        onClick={() => setTableNumber(tbl.table_no)}
                        className={`px-2.5 py-1 rounded-lg font-bold text-xs border transition-all ${
                          tableNumber === tbl.table_no
                            ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                        }`}
                      >
                        {tbl.table_no}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between font-bold mb-1">
                  <span className="text-slate-800 dark:text-slate-200">Portion Quantity:</span>
                  <span className="text-emerald-800 dark:text-emerald-400 text-sm">{portionCount} portions (Total: Rs. {selectedDish.price_lkr * portionCount})</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setPortionCount(n)}
                      className={`flex-1 py-1.5 rounded-lg font-bold border transition-all ${
                        portionCount === n
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm'
                          : 'bg-[#f8faf9] dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-[#d1ded5] dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-slate-800 dark:text-slate-200 font-bold block mb-1">Kitchen / Chef Notes</label>
                <textarea
                  rows="2"
                  value={customerNote}
                  onChange={(e) => setCustomerNote(e.target.value)}
                  placeholder="e.g. Less oil, extra chili on the side, allergies..."
                  className="w-full bg-[#f8faf9] dark:bg-slate-800 border border-[#c6d7cd] dark:border-slate-700 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-emerald-600"
                />
              </div>

              {/* Smart FIFO Ingredient Deduction Preview */}
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/60 space-y-1">
                <span className="font-bold text-emerald-950 dark:text-emerald-300 flex items-center gap-1.5 text-[11px]">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  Smart FIFO Auto-Deduction preview:
                </span>
                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                  {selectedDish.recipe_bom.map(b => `${(b.required_kg * portionCount).toFixed(2)}kg ${b.ingredient_name.split('(')[0]}`).join(' + ')} will be automatically deducted from cold storage batches with lowest remaining shelf-life.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e1eae4] dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowNewOrderModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold shadow-md shadow-emerald-700/20 flex items-center gap-1.5"
                >
                  <Check className="h-4 w-4" /> Confirm & Send to Kitchen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
