'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, X, Trash2, Utensils, MapPin, Edit, GripVertical } from 'lucide-react'

const SortableItem = ({ id, food, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="flex items-center justify-between bg-white p-2 rounded-md shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-2">
        <span {...listeners}>
          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
        </span>
        <div>
          <span className="font-medium text-gray-800">{food.name} (x{food.quantity})</span>
          {food.expiration_date && (
            <span className="ml-2 text-sm text-gray-500">
              Expire le : {new Date(food.expiration_date).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onEdit(food)}
          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="icon"
          onClick={() => onDelete(food)}
          className="bg-red-500 hover:bg-red-600 text-white transition-colors"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </li>
  )
}

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [places, setPlaces] = useState([])
  const [foods, setFoods] = useState([])
  const [recipes, setRecipes] = useState([])
  const [newPlace, setNewPlace] = useState('')
  const [newFood, setNewFood] = useState('')
  const [selectedPlace, setSelectedPlace] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddPlace, setShowAddPlace] = useState(false)
  const [showAddFood, setShowAddFood] = useState(false)
  const [foodToDelete, setFoodToDelete] = useState(null)
  const [foodToEdit, setFoodToEdit] = useState(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newFoodQuantity, setNewFoodQuantity] = useState(1)
  const [newFoodExpirationDate, setNewFoodExpirationDate] = useState('')
  const [placeToDelete, setPlaceToDelete] = useState(null)
  const [isDeletePlaceDialogOpen, setIsDeletePlaceDialogOpen] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()
  
  const fetchUserData = async (userId) => {
    const { data: placesData, error: placesError } = await supabase
      .from('places')
      .select('*')
      .eq('user_id', userId)
    if (placesError) setError('Erreur lors de la récupération des lieux')
    else setPlaces(placesData)

    const { data: foodsData, error: foodsError } = await supabase
      .from('foods')
      .select('*, places(id, name)')
      .eq('places.user_id', userId)
    if (foodsError) setError('Erreur lors de la récupération des aliments')
    else setFoods(foodsData)

    const { data: recipesData, error: recipesError } = await supabase
      .from('recipes')
      .select('*, recipe_ingredients(food_id, quantity)')
      .eq('user_id', userId)
    if (recipesError) setError('Erreur lors de la récupération des recettes' + recipes)
    else setRecipes(recipesData)
  }
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  useEffect(() => {
    const fetchUserAndData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchUserData(user.id)
      } else {
        router.push('/')
      }
      setIsLoading(false)
    }
    fetchUserAndData()
  }, [fetchUserData, router, supabase.auth])

  

  const addPlace = async () => {
    if (newPlace && user) {
      const { data, error } = await supabase
        .from('places')
        .insert({ name: newPlace, user_id: user.id })
        .select()
      if (error) setError('Erreur lors de l\'ajout du lieu')
      else {
        setPlaces([...places, data[0]])
        setNewPlace('')
        setShowAddPlace(false)
        setShowAddFood(false)
      }
    }
  }

  const addFood = async () => {
    if (newFood && selectedPlace && user) {
      const { data, error } = await supabase
        .from('foods')
        .insert({
          name: newFood,
          place_id: selectedPlace,
          quantity: newFoodQuantity,
          expiration_date: newFoodExpirationDate || null
        })
        .select('*, places(id, name)')
      if (error) setError('Erreur lors de l\'ajout de l\'aliment')
      else {
        setFoods([...foods, data[0]])
        setNewFood('')
        setNewFoodQuantity(1)
        setNewFoodExpirationDate('')
        setShowAddFood(false)
        setShowAddPlace(false)
      }
    }
  }

  const deleteFood = async () => {
    if (foodToDelete) {
      const { error } = await supabase
        .from('foods')
        .delete()
        .eq('id', foodToDelete.id)

      if (error) {
        setError('Erreur lors de la suppression de l\'aliment')
      } else {
        setFoods(foods.filter(food => food.id !== foodToDelete.id))
      }
      setFoodToDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const editFood = async () => {
    if (foodToEdit) {
      const { error } = await supabase
        .from('foods')
        .update({
          name: foodToEdit.name,
          quantity: foodToEdit.quantity,
          expiration_date: foodToEdit.expiration_date
        })
        .eq('id', foodToEdit.id)

      if (error) {
        setError('Erreur lors de la modification de l\'aliment')
      } else {
        const updatedFoods = foods.filter(food => food.id !== foodToEdit.id)
        setFoods([foodToEdit, ...updatedFoods])
      }
      setFoodToEdit(null)
      setIsEditDialogOpen(false)
    }
  }

  const deletePlace = async () => {
    if (placeToDelete) {
      // Supprimer d'abord tous les aliments associés à cet endroit
      const { error: foodsError } = await supabase
        .from('foods')
        .delete()
        .eq('place_id', placeToDelete.id)

      if (foodsError) {
        setError('Erreur lors de la suppression des aliments associés à cet endroit')
        return
      }

      // Ensuite, supprimer l'endroit lui-même
      const { error: placeError } = await supabase
        .from('places')
        .delete()
        .eq('id', placeToDelete.id)

      if (placeError) {
        setError('Erreur lors de la suppression de l\'endroit')
      } else {
        setPlaces(places.filter(place => place.id !== placeToDelete.id))
        setFoods(foods.filter(food => food.place_id !== placeToDelete.id))
      }
      setPlaceToDelete(null)
      setIsDeletePlaceDialogOpen(false)
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const groupFoodsByPlace = () => {
    const groupedFoods = {}
    places.forEach(place => {
      groupedFoods[place.id] = {
        id: place.id,
        name: place.name,
        foods: []
      }
    })
    foods.forEach(food => {
      if (food.places && groupedFoods[food.places.id]) {
        groupedFoods[food.places.id].foods.push(food)
      }
    })
    return Object.values(groupedFoods)
  }

  const handleDragEnd = async (event) => {
    const { active, over } = event

    if (active.id !== over.id) {
      const oldIndex = foods.findIndex((food) => food.id === active.id)
      const newIndex = foods.findIndex((food) => food.id === over.id)

      const newFoods = arrayMove(foods, oldIndex, newIndex)
      setFoods(newFoods)

      // Update the order in the database
      const { error } = await supabase
        .from('foods')
        .update({ order: newIndex })
        .eq('id', active.id)

      if (error) {
        setError('Erreur lors de la mise à jour de l\'ordre des aliments')
      }
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>
  }

  const groupedFoods = groupFoodsByPlace()

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white rounded-lg p-4 shadow-md">
          <h1 className="text-3xl font-bold text-gray-800 mb-4 sm:mb-0">Tableau de bord</h1>
          <Button onClick={handleLogout} variant="outline" className="w-full sm:w-auto hover:bg-gray-100 transition-colors">Déconnexion</Button>
        </div>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Tabs defaultValue="foods" className="bg-white rounded-lg shadow-md p-4">
          <TabsList className="grid w-full grid-cols-2 mb-4 h-12">
            <TabsTrigger value="foods" className="text-lg font-semibold h-full flex items-center justify-center">
              <Utensils className="mr-2 h-5 w-5" />
              Aliments
            </TabsTrigger>
            <TabsTrigger value="recipes" className="text-lg font-semibold h-full flex items-center justify-center">
              <MapPin className="mr-2 h-5 w-5" />
              Recettes
            </TabsTrigger>
          </TabsList>
          <TabsContent value="foods">
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                {!showAddFood && (
                  <Button
                    onClick={() => {
                      setShowAddPlace(!showAddPlace)
                      if (showAddFood) {
                        setShowAddFood(false)
                      }
                    }}
                    variant={showAddPlace ? "destructive" : "default"}
                    className="w-full sm:w-auto flex items-center justify-center bg-black hover:bg-gray-800 text-white transition-colors"
                  >
                    {showAddPlace ? (
                      <>
                        <X className="mr-2 h-4 w-4" /> Annuler
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un endroit
                      </>
                    )}
                  </Button>
                )}
                {!showAddPlace && (
                  <Button
                    onClick={() => {
                      setShowAddFood(!showAddFood)
                      if (showAddPlace) {
                        setShowAddPlace(false)
                      }
                    }}
                    variant={showAddFood ? "destructive" : "default"}
                    className="w-full sm:w-auto flex items-center justify-center bg-black hover:bg-gray-800 text-white transition-colors"
                  >
                    {showAddFood ? (
                      <>
                        <X className="mr-2 h-4 w-4" /> Annuler
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" /> Ajouter un aliment
                      </>
                    )}
                  </Button>
                )}
              </div>

              {showAddPlace && (
                <Card className="border-2 border-black-300">
                  <CardHeader className="bg-black-50">
                    <CardTitle className="text-black-700">Ajouter un endroit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      <Input
                        value={newPlace}
                        onChange={(e) => setNewPlace(e.target.value)}
                        placeholder="Nom de l'endroit"
                        className="border-black-300 focus:border-black-500"
                      />
                      <Button onClick={addPlace} className="bg-black hover:bg-gray-800 text-white transition-colors">Ajouter</Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {showAddFood && (
                <Card className="border-2 border-black-300">
                  <CardHeader className="bg-black-50">
                    <CardTitle className="text-black-700">Ajouter un aliment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <Label htmlFor="place" className="text-black-600">Endroit</Label>
                      <select
                        id="place"
                        value={selectedPlace}
                        onChange={(e) => setSelectedPlace(e.target.value)}
                        className="w-full p-2 border rounded border-black-300 focus:border-black-500"
                      >
                        <option value="">Sélectionnez un endroit</option>
                        {places.map((place) => (
                          <option key={place.id} value={place.id}>{place.name}</option>
                        ))}
                      </select>
                      <div className="flex items-center space-x-2">
                        <Input
                          value={newFood}
                          onChange={(e) => setNewFood(e.target.value)}
                          placeholder="Nom de l'aliment"
                          className="border-black-300 focus:border-black-500"
                        />
                        <Input
                          type="number"
                          value={newFoodQuantity}
                          onChange={(e) => setNewFoodQuantity(parseInt(e.target.value) || 1)}
                          placeholder="Quantité"
                          min="1"
                          className="border-black-300 focus:border-black-500"
                        />
                      </div>
                      <Label className="flex items-center space-y-2 text-black-600">Date d&apos;expiration : </Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="date"
                          value={newFoodExpirationDate}
                          onChange={(e) => setNewFoodExpirationDate(e.target.value)}
                          placeholder="Date de péremption (optionnel)"
                          className="border-black-300 focus:border-black-500"
                        />
                        <Button onClick={addFood} className="bg-black hover:bg-gray-800 text-white transition-colors">Ajouter</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupedFoods.map((place) => (
                  <Card key={place.id} className="border-2 border-black-300 hover:shadow-lg transition-shadow flex flex-col relative" style={{ height: '400px' }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setPlaceToDelete(place)
                        setIsDeletePlaceDialogOpen(true)
                      }}
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-100 transition-colors z-10"
                      aria-label={`Supprimer ${place.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <CardHeader className="bg-black-50">
                      <CardTitle className="text-black-700">{place.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow overflow-auto">
                      {place.foods.length > 0 ? (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                        >
                          <SortableContext
                            items={place.foods.map(food => food.id)}
                            strategy={verticalListSortingStrategy}
                          >
                            <ul className="space-y-2">
                              {place.foods.map((food) => (
                                <SortableItem
                                  key={food.id}
                                  id={food.id}
                                  food={food}
                                  onEdit={() => {
                                    setFoodToEdit(food)
                                    setIsEditDialogOpen(true)
                                  }}
                                  onDelete={() => {
                                    setFoodToDelete(food)
                                    setIsDeleteDialogOpen(true)
                                  }}
                                />
                              ))}
                            </ul>
                          </SortableContext>
                        </DndContext>
                      ) : (
                        <p className="text-gray-500 italic">Aucun aliment dans cet endroit</p>
                      )}
                    </CardContent>
                    <CardFooter className="bg-gray-50 flex items-center justify-center h-12 mt-auto">
                      <p className="text-sm text-gray-600">
                        {place.foods.length} aliment{place.foods.length > 1 ? 's' : ''}
                      </p>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="recipes">
            <Card className="border-2 border-black-300">
              <CardHeader className="bg-black-50">
                <CardTitle className="text-black-700">Recettes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Fonctionnalité de recettes à implémenter</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-gray-600">
            {"Êtes-vous sûr de vouloir supprimer l'aliment \"" + foodToDelete?.name + "\" ?"}
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors">
              Annuler
            </Button>
            <Button variant="destructive" onClick={deleteFood} className="bg-red-500 hover:bg-red-600 text-white transition-colors">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeletePlaceDialogOpen} onOpenChange={setIsDeletePlaceDialogOpen}>
        <DialogContent className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-gray-600">
              Êtes-vous sûr de vouloir supprimer l'endroit &quot;{placeToDelete?.name}&quot; ?
              Cette action supprimera également tous les aliments associés à cet endroit.
              Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeletePlaceDialogOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors">
              Annuler
            </Button>
            <Button variant="destructive" onClick={deletePlace} className="bg-red-500 hover:bg-red-600 text-white transition-colors">Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white rounded-lg p-6 max-w-md mx-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800">Modifier l&apos;aliment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editFoodName" className="text-gray-700">Nom de l&apos;aliment</Label>
              <Input
                id="editFoodName"
                value={foodToEdit?.name || ''}
                onChange={(e) => setFoodToEdit({ ...foodToEdit, name: e.target.value })}
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editFoodQuantity" className="text-gray-700">Quantité</Label>
              <Input
                id="editFoodQuantity"
                type="number"
                value={foodToEdit?.quantity || 1}
                onChange={(e) => setFoodToEdit({ ...foodToEdit, quantity: parseInt(e.target.value) || 1 })}
                min="1"
                className="w-full mt-1"
              />
            </div>
            <div>
              <Label htmlFor="editFoodExpirationDate" className="text-gray-700">Date d&apos;expiration</Label>
              <Input
                id="editFoodExpirationDate"
                type="date"
                value={foodToEdit?.expiration_date || ''}
                onChange={(e) => setFoodToEdit({ ...foodToEdit, expiration_date: e.target.value })}
                className="w-full mt-1"
              />
            </div>
          </div>
          <DialogFooter className="mt-6 flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors">
              Annuler
            </Button>
            <Button onClick={editFood} className="bg-blue-500 hover:bg-blue-600 text-white transition-colors">Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}