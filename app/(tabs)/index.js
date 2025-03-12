import { StyleSheet, FlatList, TouchableOpacity, Modal, ActivityIndicator, View, ScrollView } from "react-native"
import { useState, useEffect } from "react"
import { Image } from "react-native"
import { Stack } from "expo-router"
import { IconSymbol } from "@/components/ui/IconSymbol"

export default function PokemonListScreen() {
  const [pokemonList, setPokemonList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPokemon, setSelectedPokemon] = useState(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)

  useEffect(() => {
    const fetchPokemonList = async () => {
      try {
        const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=20&offset=0")
        const data = await response.json()

        const detailedPokemonList = await Promise.all(
          data.results.map(async (pokemon) => {
            const pokemonResponse = await fetch(pokemon.url)
            const pokemonData = await pokemonResponse.json()
            return {
              id: pokemonData.id,
              name: pokemonData.name,
              image: pokemonData.sprites.front_default,
              url: pokemon.url,
            }
          }),
        )

        setPokemonList(detailedPokemonList)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching Pokemon list:", error)
        setLoading(false)
      }
    }

    fetchPokemonList()
  }, [])

  const handlePokemonPress = async (pokemon) => {
    setLoadingDetails(true)
    setModalVisible(true)

    try {
      const response = await fetch(pokemon.url)
      const fullData = await response.json()
      setSelectedPokemon(fullData)
    } catch (error) {
      console.error("Error fetching Pokemon details:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const closeModal = () => {
    setModalVisible(false)
    setSelectedPokemon(null)
  }

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#1E5631" />
        <Text style={styles.loadingText}>Cargando Pokémon...</Text>
      </View>
    )
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Pokémon",
          headerShown: true,
          headerStyle: {
            backgroundColor: "#000000",
          },
          headerTintColor: "#ffffff",
        }}
      />
      <View style={styles.container}>
        <FlatList
          data={pokemonList}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.pokemonItem} onPress={() => handlePokemonPress(item)}>
              <View style={styles.pokemonCard}>
                <Image source={{ uri: item.image }} style={styles.pokemonImage} />
                <Text style={styles.pokemonName}>{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</Text>
                <View style={styles.pokemonIdBadge}>
                  <Text style={styles.pokemonIdText}>#{item.id}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

        {/* Modal para mostrar detalles del Pokémon */}
        <Modal animationType="slide" transparent={true} visible={modalVisible} onRequestClose={closeModal}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <IconSymbol size={24} name="xmark.circle.fill" color="#FF3B30" />
              </TouchableOpacity>

              {loadingDetails ? (
                <View style={styles.loaderContainer}>
                  <ActivityIndicator size="large" color="#1E5631" />
                  <Text style={styles.loadingText}>Cargando detalles...</Text>
                </View>
              ) : selectedPokemon ? (
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                  <Image source={{ uri: selectedPokemon.sprites.front_default }} style={styles.modalImage} />

                  <Text style={styles.modalTitle}>
                    {selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}
                  </Text>

                  <View style={styles.statsContainer}>
                    <Text style={styles.sectionTitle}>Información Básica</Text>
                    <Text style={styles.infoText}>Altura: {selectedPokemon.height / 10} m</Text>
                    <Text style={styles.infoText}>Peso: {selectedPokemon.weight / 10} kg</Text>
                    <Text style={styles.infoText}>
                      Tipo(s):{" "}
                      {selectedPokemon.types
                        .map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1))
                        .join(", ")}
                    </Text>

                    <Text style={styles.sectionTitle}>Estadísticas</Text>
                    {selectedPokemon.stats.map((stat, index) => (
                      <View key={index} style={styles.statRow}>
                        <Text style={styles.statName}>{formatStatName(stat.stat.name)}:</Text>
                        <Text style={styles.statValue}>{stat.base_stat}</Text>
                        <View style={styles.statBarContainer}>
                          <View style={[styles.statBar, { width: `${Math.min(stat.base_stat, 100)}%` }]} />
                        </View>
                      </View>
                    ))}

                    <Text style={styles.sectionTitle}>Habilidades</Text>
                    {selectedPokemon.abilities.map((ability, index) => (
                      <Text key={index} style={styles.infoText}>
                        {ability.ability.name.charAt(0).toUpperCase() + ability.ability.name.slice(1)}
                        {ability.is_hidden ? " (Oculta)" : ""}
                      </Text>
                    ))}
                  </View>

                  <TouchableOpacity style={styles.closeModalButton} onPress={closeModal}>
                    <Text style={styles.closeModalButtonText}>Cerrar</Text>
                  </TouchableOpacity>
                </ScrollView>
              ) : (
                <Text style={styles.errorText}>No se pudieron cargar los detalles</Text>
              )}
            </View>
          </View>
        </Modal>
      </View>
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

// Importar Text para evitar problemas con ThemedText
import { Text } from "react-native"

// Estilos actualizados con fondo negro y verde oscuro para toda la aplicación
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#000000",
  },
  listContent: {
    paddingVertical: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000000",
  },
  loadingText: {
    marginTop: 10,
    color: "#ffffff",
    fontSize: 16,
  },
  errorText: {
    color: "#ff6b6b",
    fontSize: 16,
    textAlign: "center",
  },
  pokemonItem: {
    flex: 1,
    margin: 5,
  },
  pokemonCard: {
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    backgroundColor: "#111111",
    borderWidth: 1,
    borderColor: "#1E5631",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowColor: "#1E5631",
    elevation: 3,
  },
  pokemonImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 8,
    backgroundColor: "#222222",
  },
  pokemonName: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "500",
    color: "#ffffff",
  },
  pokemonIdBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "#1E5631",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  pokemonIdText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContent: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 16,
    padding: 20,
    backgroundColor: "#000000",
    borderWidth: 1,
    borderColor: "#1E5631",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowColor: "#1E5631",
    elevation: 5,
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    zIndex: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingTop: 10,
  },
  modalImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    alignSelf: "center",
    marginBottom: 15,
    backgroundColor: "#111111",
  },
  modalTitle: {
    fontSize: 24,
    textAlign: "center",
    marginBottom: 15,
    color: "#ffffff",
    fontWeight: "bold",
  },
  statsContainer: {
    width: "100%",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    backgroundColor: "#111111",
  },
  sectionTitle: {
    fontSize: 18,
    marginTop: 15,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1E5631",
    paddingBottom: 5,
    color: "#1E5631",
    fontWeight: "bold",
  },
  infoText: {
    color: "#dddddd",
    fontSize: 16,
    marginBottom: 4,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statName: {
    fontSize: 14,
    width: 110,
    color: "#cccccc",
  },
  statValue: {
    fontSize: 14,
    width: 30,
    textAlign: "right",
    marginRight: 10,
    color: "#ffffff",
  },
  statBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: "#333333",
    borderRadius: 4,
    overflow: "hidden",
  },
  statBar: {
    height: "100%",
    backgroundColor: "#1E5631",
  },
  closeModalButton: {
    backgroundColor: "#1E5631",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: "center",
  },
  closeModalButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
    textAlign: "center",
  },
})

