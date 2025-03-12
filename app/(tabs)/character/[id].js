import { useState, useEffect } from "react"
import { View, StyleSheet, ActivityIndicator, ScrollView } from "react-native"
import { useLocalSearchParams, Stack } from "expo-router"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import { Image } from "react-native"

export default function PokemonDetail() {
  const { id } = useLocalSearchParams()
  const [pokemon, setPokemon] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        console.log(`Fetching Pokemon with ID: ${id}`)
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("Pokemon data received:", data.name)
        setPokemon(data)
        setLoading(false)
      } catch (err) {
        console.error("Error fetching Pokemon:", err)
        setError(err.message)
        setLoading(false)
      }
    }

    fetchPokemon()
  }, [id])

  if (loading) {
    return (
      <ThemedView style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#00BFFF" />
        <ThemedText style={styles.loadingText}>Cargando Pokémon...</ThemedText>
      </ThemedView>
    )
  }

  if (error || !pokemon) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>Error al cargar el Pokémon: {error || "Datos no disponibles"}</ThemedText>
      </ThemedView>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1),
          headerShown: true,
        }}
      />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <ThemedView style={styles.container}>
          <Image
            source={{
              uri: pokemon.sprites.front_default || "https://via.placeholder.com/200",
            }}
            style={styles.image}
          />

          <ThemedText type="title">{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</ThemedText>

          <ThemedView style={styles.statsContainer}>
            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Información Básica
            </ThemedText>
            <ThemedText>Altura: {pokemon.height / 10} m</ThemedText>
            <ThemedText>Peso: {pokemon.weight / 10} kg</ThemedText>
            <ThemedText>
              Tipo(s): {pokemon.types.map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1)).join(", ")}
            </ThemedText>

            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Estadísticas
            </ThemedText>
            {pokemon.stats.map((stat, index) => (
              <View key={index} style={styles.statRow}>
                <ThemedText style={styles.statName}>{formatStatName(stat.stat.name)}:</ThemedText>
                <ThemedText style={styles.statValue}>{stat.base_stat}</ThemedText>
                <View style={styles.statBarContainer}>
                  <View style={[styles.statBar, { width: `${Math.min(stat.base_stat, 100)}%` }]} />
                </View>
              </View>
            ))}

            <ThemedText type="defaultSemiBold" style={styles.sectionTitle}>
              Habilidades
            </ThemedText>
            {pokemon.abilities.map((ability, index) => (
              <ThemedText key={index}>
                {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
                {ability.is_hidden ? " (Oculta)" : ""}
              </ThemedText>
            ))}
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </>
  )
}

// Helper function to format stat names
function formatStatName(statName) {
  const statMap = {
    hp: "HP",
    attack: "Ataque",
    defense: "Defensa",
    "special-attack": "Atq. Especial",
    "special-defense": "Def. Especial",
    speed: "Velocidad",
  }

  return statMap[statName] || statName
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 20,
    backgroundColor: "#333",
  },
  statsContainer: {
    width: "100%",
    borderRadius: 10,
    padding: 15,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    marginTop: 15,
    marginBottom: 10,
    borderBottomWidth: 1,
    paddingBottom: 5,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statName: {
    fontSize: 16,
    width: 110,
  },
  statValue: {
    fontSize: 16,
    width: 30,
    textAlign: "right",
    marginRight: 10,
  },
  statBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: "#444",
    borderRadius: 5,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    backgroundColor: "#00BFFF",
  },
})

