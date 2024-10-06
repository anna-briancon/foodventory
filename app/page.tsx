import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Utensils, RefrigeratorIcon, BookOpen } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-purple-100 p-4">
      <Card className="w-full max-w-4xl shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-3xl font-bold text-center text-gray-800">Bienvenue sur Foodventory</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <p className="text-xl text-center text-gray-700">
            Gérez votre inventaire alimentaire et vos recettes facilement.
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <RefrigeratorIcon className="h-8 w-8 text-blue-500 mx-auto" />
                <CardTitle className="text-lg font-semibold text-center text-gray-700">Inventaire intelligent</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center text-gray-600">Suivez facilement vos aliments et leur date de péremption.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <BookOpen className="h-8 w-8 text-blue-500 mx-auto" />
                <CardTitle className="text-lg font-semibold text-center text-gray-700">Gestion des recettes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center text-gray-600">Organisez vos recettes et planifiez vos repas.</p>
              </CardContent>
            </Card>
            {/* <Card>
              <CardHeader>
                <Utensils className="h-8 w-8 text-blue-500 mx-auto" />
                <CardTitle className="text-lg font-semibold text-center text-gray-700">Suggestions de repas</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-center text-gray-600">Obtenez des idées de repas basées sur votre inventaire.</p>
              </CardContent>
            </Card> */}
          </div>

          <div className="flex justify-center space-x-4">
            <Button asChild className="bg-black hover:bg-gray-800 text-white">
              <Link href="/login">Se connecter</Link>
            </Button>
            <Button asChild variant="outline" className="border-black text-black hover:bg-gray-100">
              <Link href="/register">S'inscrire</Link>
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Découvrez comment Foodventory peut transformer votre expérience culinaire.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}