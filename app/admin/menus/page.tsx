"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, Edit, Trash2, X, CheckCircle2, Utensils, List } from "lucide-react";

// Tipos de datos
type OptionType = "select" | "text";

interface MenuOption {
  id: string;
  name: string;
  type: OptionType;
  values: string[];
}

interface Dish {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  customizable: boolean;
  options: MenuOption[];
}

interface Menu {
  id: string;
  restaurantId: string;
  name: string;
  description: string;
  image?: string;
  dishes: Dish[];
}

interface DishForm {
  name: string;
  description: string;
  price: string;
  category: string;
  image: string;
  customizable: boolean;
}

// Utilidades para localStorage
const MENUS_KEY = "restaurant-menus";
function loadMenus() {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(MENUS_KEY);
  return data ? JSON.parse(data) : [];
}

function saveMenus(menus: Menu[]) {
  localStorage.setItem(MENUS_KEY, JSON.stringify(menus));
}

// Hook para manejar menús
function useMenus() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [currentRestaurantId, setCurrentRestaurantId] = useState<string | null>(null);
  const [isAddMenuDialogOpen, setIsAddMenuDialogOpen] = useState(false);
  const [isEditMenuDialogOpen, setIsEditMenuDialogOpen] = useState(false);
  const [isDeleteMenuDialogOpen, setIsDeleteMenuDialogOpen] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<Menu | null>(null);
  const [newMenu, setNewMenu] = useState<Partial<Menu>>({
    name: "",
    description: "",
    dishes: [],
  });

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Verificar autenticación
    const isAuthenticated = localStorage.getItem("adminAuthenticated") === "true";
    if (!isAuthenticated) {
      router.push("/admin/login");
      return;
    }

    // Obtener el ID del restaurante actual
    const restaurantId = localStorage.getItem("restaurantId");
    if (restaurantId) {
      setCurrentRestaurantId(restaurantId);
      const storedMenus = loadMenus();
      // Filtrar menús por restaurante
      const restaurantMenus = storedMenus.filter(menu => menu.restaurantId === restaurantId);
      setMenus(restaurantMenus);
    }
  }, [router]);

  const handleAddMenu = () => {
    if (!currentRestaurantId) return;

    const newId = `menu${Math.floor(1000 + Math.random() * 9000)}`;
    const menuToAdd: Menu = {
      id: newId,
      restaurantId: currentRestaurantId,
      name: newMenu.name || "",
      description: newMenu.description || "",
      dishes: newMenu.dishes || [],
    };

    const updatedMenus = [...menus, menuToAdd];
    setMenus(updatedMenus);
    saveMenus(updatedMenus);
    setIsAddMenuDialogOpen(false);
    setNewMenu({
      name: "",
      description: "",
      dishes: [],
    });

    toast({
      title: "Menú creado",
      description: `${menuToAdd.name} ha sido creado exitosamente`,
    });
  };

  const handleUpdateMenu = () => {
    if (!currentMenu) return;

    const updatedMenus = menus.map((menu: Menu) => 
      menu.id === currentMenu.id ? currentMenu : menu
    );
    setMenus(updatedMenus);
    saveMenus(updatedMenus);
    setIsEditMenuDialogOpen(false);
    setCurrentMenu(null);

    toast({
      title: "Menú actualizado",
      description: `${currentMenu.name} ha sido actualizado exitosamente`,
    });
  };

  const handleDeleteMenu = () => {
    if (!currentMenu) return;

    const updatedMenus = menus.filter(menu => menu.id !== currentMenu.id);
    setMenus(updatedMenus);
    saveMenus(updatedMenus);
    setIsDeleteMenuDialogOpen(false);
    setCurrentMenu(null);

    toast({
      title: "Menú eliminado",
      description: `${currentMenu.name} ha sido eliminado exitosamente`,
    });
  };

  return [menus, setMenus, currentRestaurantId, isAddMenuDialogOpen, isEditMenuDialogOpen, isDeleteMenuDialogOpen, currentMenu, newMenu] as const;
}

// Componente principal
export default function MenuManagementPage() {
  const [menus, setMenus, currentRestaurantId, isAddMenuDialogOpen, isEditMenuDialogOpen, isDeleteMenuDialogOpen, currentMenu, newMenu] = useMenus();
  const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [menuForm, setMenuForm] = useState({ name: "", description: "", image: "" });
  const [dishForm, setDishForm] = useState<DishForm>({
    name: "",
    description: "",
    price: "",
    category: "entradas",
    image: "",
    customizable: false,
  });
  const [optionForm, setOptionForm] = useState({ name: "", type: "select" as OptionType, values: "" });
  const [dishOptions, setDishOptions] = useState<MenuOption[]>([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [showDishModal, setShowDishModal] = useState(false);
  const [editMenuMode, setEditMenuMode] = useState(false);
  const [editDishMode, setEditDishMode] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  // Manejo de imágenes
  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, cb: (img: string) => void) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => cb(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  // Funciones para abrir/cerrar modales y setear modo edición
  const openAddMenuModal = () => { setEditMenuMode(false); setMenuForm({ name: "", description: "", image: "" }); setShowMenuModal(true); };
  const openEditMenuModal = (menu: Menu) => { setEditMenuMode(true); setMenuForm({ name: menu.name, description: menu.description, image: menu.image || "" }); setSelectedMenu(menu); setShowMenuModal(true); };
  const closeMenuModal = () => { setShowMenuModal(false); setMenuForm({ name: "", description: "", image: "" }); };

  const openAddDishModal = () => { setEditDishMode(false); setDishForm({ name: "", description: "", price: "", category: "entradas", image: "", customizable: false }); setDishOptions([]); setShowDishModal(true); };
  const openEditDishModal = (dish: Dish) => { setEditDishMode(true); setDishForm({ ...dish, price: dish.price.toString() }); setDishOptions(dish.options); setSelectedDish(dish); setShowDishModal(true); };
  const closeDishModal = () => { setShowDishModal(false); setDishForm({ name: "", description: "", price: "", category: "entradas", image: "", customizable: false }); setDishOptions([]); setSelectedDish(null); };

  // Guardar menú (crear o editar)
  const saveMenu = () => {
    if (!menuForm.name.trim()) return;
    if (editMenuMode && selectedMenu) {
      // Editar menú existente
      const updatedMenus = menus.map((m: Menu) => m.id === selectedMenu.id ? { ...selectedMenu, ...menuForm } : m);
      setMenus(updatedMenus);
      saveMenus(updatedMenus);
      toast({ title: "Menú actualizado", description: `${menuForm.name} actualizado correctamente` });
    } else {
      // Crear nuevo menú
      const newMenu: Menu = {
        id: Date.now().toString(),
        name: menuForm.name,
        description: menuForm.description,
        image: menuForm.image,
        dishes: [],
        restaurantId: currentRestaurantId || "",
      };
      const updatedMenus = [...menus, newMenu];
      setMenus(updatedMenus);
      saveMenus(updatedMenus);
      toast({ title: "Menú creado", description: `${menuForm.name} creado correctamente` });
    }
    closeMenuModal();
  };

  // Guardar platillo (crear o editar)
  const saveDish = () => {
    if (!selectedMenu || !dishForm.name || !dishForm.price) return;
    if (editDishMode && selectedDish) {
      // Editar platillo existente
      const updatedMenus = menus.map((menu: Menu) => {
        if (menu.id === selectedMenu.id) {
          return {
            ...menu,
            dishes: menu.dishes.map((d) => d.id === selectedDish.id ? { ...selectedDish, ...dishForm, price: Number(dishForm.price), options: dishOptions } : d),
          };
        }
        return menu;
      });
      setMenus(updatedMenus);
      saveMenus(updatedMenus);
      toast({ title: "Platillo actualizado", description: `${dishForm.name} actualizado correctamente` });
    } else {
      // Crear nuevo platillo
      const newDish: Dish = {
        id: `dish${Math.floor(1000 + Math.random() * 9000)}`,
        name: dishForm.name,
        description: dishForm.description || "",
        price: Number(dishForm.price),
        category: dishForm.category,
        image: dishForm.image,
        customizable: dishForm.customizable,
        options: dishOptions,
      };
      const updatedMenus = menus.map((menu: Menu) => {
        if (menu.id === selectedMenu.id) {
          return {
            ...menu,
            dishes: [...menu.dishes, newDish],
          };
        }
        return menu;
      });
      setMenus(updatedMenus);
      saveMenus(updatedMenus);
      toast({ title: "Platillo agregado", description: `${dishForm.name} agregado correctamente` });
    }
    closeDishModal();
  };

  // CRUD de Menús
  function addMenu() {
    if (!menuForm.name.trim()) return;
    setMenus([
      ...menus,
      {
        id: Date.now().toString(),
        name: menuForm.name,
        description: menuForm.description,
        image: menuForm.image,
        dishes: [],
        restaurantId: currentRestaurantId || "",
      },
    ]);
    setMenuForm({ name: "", description: "", image: "" });
  }
  function deleteMenu(id: string) {
    setMenus(menus.filter((m) => m.id !== id));
    setSelectedMenu(null);
  }
  function selectMenu(menu: Menu) {
    setSelectedMenu(menu);
    setSelectedDish(null);
  }

  // CRUD de Platillos
  function addDish() {
    if (!selectedMenu || !dishForm.name || !dishForm.price) return;

    const newDish: Dish = {
      id: `dish${Math.floor(1000 + Math.random() * 9000)}`,
      name: dishForm.name,
      description: dishForm.description || "",
      price: Number(dishForm.price),
      category: dishForm.category,
      image: dishForm.image,
      customizable: dishForm.customizable,
      options: dishOptions,
    };

    const updatedMenus = menus.map((menu: Menu) => {
      if (menu.id === selectedMenu.id) {
        return {
          ...menu,
          dishes: [...menu.dishes, newDish],
        };
      }
      return menu;
    });

    setMenus(updatedMenus);
    saveMenus(updatedMenus);
    setDishForm({
      name: "",
      description: "",
      price: "",
      category: "entradas",
      image: "",
      customizable: false,
    });
    setDishOptions([]);
    setSelectedDish(null);

    toast({
      title: "Plato agregado",
      description: `${newDish.name} ha sido agregado al menú exitosamente`,
    });
  };
  function deleteDish(id: string) {
    if (!selectedMenu) return;
    setMenus(
      menus.map((menu: Menu) =>
        menu.id === selectedMenu.id
          ? { ...menu, dishes: menu.dishes.filter((d) => d.id !== id) }
          : menu
      )
    );
    setSelectedDish(null);
  }
  function selectDish(dish: Dish) {
    setSelectedDish(dish);
  }

  // CRUD de Opciones
  function addOption() {
    if (!optionForm.name.trim()) return;
    setDishOptions([
      ...dishOptions,
      {
        id: Date.now().toString(),
        name: optionForm.name,
        type: optionForm.type,
        values: optionForm.values.split(",").map((v) => v.trim()),
      },
    ]);
    setOptionForm({ name: "", type: "select", values: "" });
  }
  function deleteOption(id: string) {
    setDishOptions(dishOptions.filter((o) => o.id !== id));
  }

  const handleAddOption = () => {
    if (!optionForm.name || !optionForm.values) return;

    const newOption: MenuOption = {
      id: `option${Math.floor(1000 + Math.random() * 9000)}`,
      name: optionForm.name,
      type: optionForm.type as OptionType,
      values: optionForm.values.split(",").map(v => v.trim()),
    };

    setDishOptions([...dishOptions, newOption]);
    setOptionForm({ name: "", type: "select" as OptionType, values: "" });
  };

  // UI PROFESIONAL Y VISUAL
  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-50">
      {/* Sidebar Menús */}
      <aside className="w-72 bg-white border-r p-6 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2"><List className="w-5 h-5" /> Menús</h2>
          <Button size="icon" variant="outline" onClick={openAddMenuModal}><Plus /></Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {menus.length === 0 ? (
            <div className="text-gray-400 text-center mt-10">No hay menús creados</div>
          ) : (
            <ul className="space-y-2">
              {menus.map((menu: Menu) => (
                <li key={menu.id}>
                  <Button
                    variant={selectedMenu?.id === menu.id ? "secondary" : "ghost"}
                    className="w-full flex justify-between items-center"
                    onClick={() => selectMenu(menu)}
                  >
                    <span className="truncate">{menu.name}</span>
                    <span className="flex gap-1">
                      <Edit className="w-4 h-4 text-blue-500" onClick={e => { e.stopPropagation(); openEditMenuModal(menu); }} />
                      <Trash2 className="w-4 h-4 text-red-500" onClick={e => { e.stopPropagation(); deleteMenu(menu.id); }} />
                    </span>
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
      {/* Main Content: Platillos */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2"><Utensils className="w-6 h-6" /> Platillos</h1>
          {selectedMenu && (
            <Button onClick={openAddDishModal} variant="default"><Plus className="mr-2" />Agregar Platillo</Button>
          )}
        </div>
        {!selectedMenu ? (
          <div className="text-gray-400 text-center mt-20 text-lg">Selecciona un menú para ver sus platillos</div>
        ) : selectedMenu.dishes.length === 0 ? (
          <div className="text-gray-400 text-center mt-20 text-lg">No hay platillos en este menú</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedMenu.dishes.map((dish) => (
              <div key={dish.id} className="bg-white rounded-lg shadow p-4 flex flex-col">
                {dish.image && <img src={dish.image} alt={dish.name} className="w-full h-32 object-cover rounded mb-2" />}
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">{dish.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{dish.description}</p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-rose-600">S/ {dish.price.toFixed(2)}</span>
                    <span className="bg-gray-100 text-xs px-2 py-1 rounded">{dish.category}</span>
                  </div>
                  {dish.options.length > 0 && (
                    <div className="text-xs text-gray-600 mb-2">
                      Opciones: {dish.options.map(opt => opt.name).join(", ")}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="outline" onClick={() => openEditDishModal(dish)}><Edit className="w-4 h-4" /> Editar</Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteDish(dish.id)}><Trash2 className="w-4 h-4" /> Eliminar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: Crear/Editar Menú */}
      <Dialog open={showMenuModal} onOpenChange={setShowMenuModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editMenuMode ? "Editar Menú" : "Nuevo Menú"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input className="input input-bordered w-full" placeholder="Nombre del menú" value={menuForm.name} onChange={e => setMenuForm(f => ({ ...f, name: e.target.value }))} />
            <input className="input input-bordered w-full" placeholder="Descripción" value={menuForm.description} onChange={e => setMenuForm(f => ({ ...f, description: e.target.value }))} />
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, img => setMenuForm(f => ({ ...f, image: img })))} />
            {menuForm.image && <img src={menuForm.image} alt="preview" className="w-full h-24 object-cover rounded" />}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeMenuModal}>Cancelar</Button>
            <Button onClick={saveMenu}>{editMenuMode ? "Guardar Cambios" : "Crear Menú"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL: Crear/Editar Platillo */}
      <Dialog open={showDishModal} onOpenChange={setShowDishModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editDishMode ? "Editar Platillo" : "Nuevo Platillo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <input className="input input-bordered w-full" placeholder="Nombre del platillo" value={dishForm.name} onChange={e => setDishForm(f => ({ ...f, name: e.target.value }))} />
            <input className="input input-bordered w-full" placeholder="Descripción" value={dishForm.description} onChange={e => setDishForm(f => ({ ...f, description: e.target.value }))} />
            <input className="input input-bordered w-full" placeholder="Precio" type="number" value={dishForm.price} onChange={e => setDishForm(f => ({ ...f, price: e.target.value }))} />
            <input className="input input-bordered w-full" placeholder="Categoría" value={dishForm.category} onChange={e => setDishForm(f => ({ ...f, category: e.target.value }))} />
            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, img => setDishForm(f => ({ ...f, image: img })))} />
            {dishForm.image && <img src={dishForm.image} alt="preview" className="w-full h-24 object-cover rounded" />}
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={dishForm.customizable} onChange={e => setDishForm(f => ({ ...f, customizable: e.target.checked }))} />
              <span>Permitir personalización</span>
            </div>
            {/* Opciones personalizables */}
            {dishForm.customizable && (
              <div className="border p-2 rounded">
                <h3 className="font-semibold mb-1">Opciones personalizables</h3>
                <div className="flex gap-2 mb-2">
                  <input className="input input-bordered" placeholder="Nombre de la opción" value={optionForm.name} onChange={e => setOptionForm(f => ({ ...f, name: e.target.value }))} />
                  <select className="input input-bordered" value={optionForm.type} onChange={e => setOptionForm(f => ({ ...f, type: e.target.value as OptionType }))}>
                    <option value="select">Select</option>
                    <option value="text">Texto</option>
                  </select>
                  {optionForm.type !== "text" && (
                    <input className="input input-bordered" placeholder="Valores (separados por coma)" value={optionForm.values} onChange={e => setOptionForm(f => ({ ...f, values: e.target.value }))} />
                  )}
                  <Button size="icon" variant="secondary" onClick={handleAddOption}><Plus /></Button>
                </div>
                <ul>
                  {dishOptions.map((opt) => (
                    <li key={opt.id} className="flex items-center gap-2">
                      <span>{opt.name} ({opt.type})</span>
                      {opt.values && <span className="text-xs">[{opt.values.join(", ")}]</span>}
                      <Button size="icon" variant="destructive" onClick={() => setDishOptions(dishOptions.filter(o => o.id !== opt.id))}><Trash2 className="w-4 h-4" /></Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDishModal}>Cancelar</Button>
            <Button onClick={saveDish}>{editDishMode ? "Guardar Cambios" : "Agregar Platillo"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 