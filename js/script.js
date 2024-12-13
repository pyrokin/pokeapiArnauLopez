
let team1 = document.getElementById("team1pokemon");
let team2 = document.getElementById("team2pokemon");
const addNewPokemon = document.getElementById("getPokemon");
let numberOfPokemon = document.getElementById("pokemonNumber");
let addNewPokemonforTeam2 = document.getElementById("getPokemon2");
const begin_battle = document.getElementById("startBattle");
const firsttext = document.getElementById("first text");
let additions = document.getElementById("additions");
let infoText = document.getElementById("infoText");
let selectedTeam1Pokemon = null;
let selectedTeam2Pokemon = null;
let defeated = false;
let pokemonLimit = numberOfPokemon.value;

const typeChart = {
    normal: { rock: 0.5, ghost: 0, steel: 0.5 },
    fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
    water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
    grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
    electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
    ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
    fighting: { normal: 2, ice: 2, rock: 0.5, dark: 0.5, steel: 0.5 },
    poison: { grass: 2, poison: 0.5, ground: 0.5, psychic: 2, bug: 0.5, rock: 0.5, ghost: 0.5, dark: 0.5 },
    ground: { fire: 2, electric: 2, grass: 0.5, poison: 0.5, flying: 0.5, bug: 0.5, rock: 2, steel: 2 },
    flying: { grass: 0.5, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
    psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0 },
    bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 0.5, steel: 0.5 },
    rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 0.5, bug: 2, steel: 0.5 },
    ghost: { normal: 0, poison: 0.5, bug: 0.5, ghost: 2, dark: 2 },
    dragon: { dragon: 2, steel: 0.5 },
    dark: { fighting: 0.5, psychic: 0.5, ghost: 2, dark: 0.5 },
    steel: { fire: 0.5, water: 0.5, electric: 0.5, steel: 0.5 },
    fairy: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, bug: 0.5, dark: 2 },
    default: {}
};

setInterval(() => {
    if (team2.children.length >= pokemonLimit) {
        addNewPokemonforTeam2.disabled = true;
    }
    if (team1.children.length >= pokemonLimit) {
        addNewPokemon.disabled = true;
    }
    if ((team1.children.length == pokemonLimit) && (team2.children.length != pokemonLimit)) {
        firsttext.style.display = "block";
    }

}, 1)
function applyTypeClass(card, types) {
    const primaryType = types[0]?.type.name || "default";
    card.classList.add(`type-${primaryType}`);
}

function updateCardColorForDefeat(card) {
    card.classList.add('defeated');
}
async function fetchDataMovements(moveUrl) {
    const response = await fetch(moveUrl);
    const data = await response.json();
    return data;
}
async function fetchData(toAppend) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomNumber()}`);
    const data = await response.json();

    for (let i = 0; i < toAppend.children.length; i++) {
        if (toAppend.children[i].id == data.id) return;
    }

    const temp = document.getElementById("template");
    const clonedTemp = temp.content.cloneNode(true);
    let card = clonedTemp.querySelector(".pokeEntry");

    // Asignar información básica
    card.setAttribute("id", data.id);
    clonedTemp.querySelector(".pokeName").textContent = data.name;
    clonedTemp.querySelector(".abilities").textContent = "Abilities: " + data.abilities.map(a => a.ability.name).join(", ");
    clonedTemp.querySelector(".type").textContent = "Type: " + data.types.map(t => t.type.name).join(", ");
    clonedTemp.querySelector(".pokemonImage").setAttribute("src", data.sprites.front_default);
    clonedTemp.querySelector(".atacks").textContent = "Attack: " + data.stats[1].base_stat;
    clonedTemp.querySelector(".defense").textContent = "Defense: " + data.stats[2].base_stat;

    assignInitialHP(card);

    // Colorear por tipo
    applyTypeClass(card, data.types);

    // Añadir movimientos con lógica de combate
    const attackerAttack = data.stats[1].base_stat;
    const defenderCard = toAppend === team1 ? team2 : team1; // Equipo contrario
    await addMovesToCard(card, data.moves, attackerAttack, defenderCard);

    toAppend.appendChild(card);
    additions.innerHTML += `The Pokémon ${data.name} has been added to the team!<br>`;
}

function randomNumber() {
    return Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
}
function selectRandomMoves(maximum) {
    return Math.floor(Math.random() * (maximum - 1 + 1)) + 1;
}
addNewPokemon.addEventListener("click", () => {
    for (let i = 0; i < numberOfPokemon.value; i++) {
        fetchData(team1);
    }
});


addNewPokemonforTeam2.addEventListener("click", () => {
    for (let i = 0; i < numberOfPokemon.value; i++) {
        fetchData(team2);
    }
    fightTurn(counter);
});

function showAbilities(numberRandom) {
    const team = numberRandom === 1 ? team1 : team2;
    if (!team.children.length) return;
    const randomIndex = Math.floor(Math.random() * team.children.length);
    const selectedPokemon = team.children[randomIndex];
    const abilities = selectedPokemon.querySelector(".abilities").textContent;
    infoText.innerHTML += `Random Pokémon abilities: ${abilities}<br>`;
}



function assignInitialHP(card) {
    const hp = 100;
    card.setAttribute("data-hp", hp);
    const hpElement = document.createElement("p");
    hpElement.classList.add("hp");
    hpElement.textContent = `HP: ${hp}`;
    card.appendChild(hpElement);
}

// Get the battle mode selection
const battleMode = document.getElementById("battleMode");

function machineTurn() {
    if (team2.children.length === 0 || team1.children.length === 0) {
        return; // No Pokémon left to battle
    }
    // Filtra los hijos de team2 para excluir los que tienen la clase 'Defeated'
    const availablePokemon = Array.from(team2.children).filter(child => !child.classList.contains('defeated'));
    let machinePokemon = null;
    // Selecciona uno aleatorio de los que no están derrotados
    if (availablePokemon.length > 0) {
        machinePokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
        console.log(machinePokemon.querySelector(".pokeName").textContent);
    } else {
        console.log("No hay Pokémon disponibles que no estén derrotados.");
    }
    // Maquina selecciona el movimiento con mayor poder
    const moveButtons = Array.from(machinePokemon.querySelectorAll(".move-button"));
    if (!moveButtons.length) return;

    const bestMoveButton = moveButtons.reduce((best, current) => {
        const bestPower = parseInt(best.textContent.match(/\((\d+)\)/)?.[1] || "0");
        const currentPower = parseInt(current.textContent.match(/\((\d+)\)/)?.[1] || "0");
        return currentPower > bestPower ? current : best;
    });

    const movePower = parseInt(bestMoveButton.textContent.match(/\((\d+)\)/)?.[1] || "0");
    const attackerAttack = parseInt(machinePokemon.querySelector(".atacks").textContent.split(": ")[1]);

    // La maquina selecciona un objetivo aleatorio del equipo contrario
    const defenderOptions = Array.from(team1.children);
    const targetPokemon = defenderOptions[Math.floor(Math.random() * defenderOptions.length)];

    if (!movePower || !targetPokemon) return;

    // Calcular y aplicar daño
    const defenderDefense = parseInt(targetPokemon.querySelector(".defense").textContent.split(": ")[1]);
    const damage = calculateDamageWithTypes(movePower, attackerAttack, defenderDefense, machinePokemon, targetPokemon);
    applyDamage(targetPokemon, damage);

    infoText.innerHTML += `Machine's Pokémon ${machinePokemon.querySelector(".pokeName").textContent} used ${bestMoveButton.textContent.split(" (")[0]}!<br>`;
    if (!defeated) infoText.innerHTML += `Damage dealt: ${damage}.<br>`;
    counter++;
}
function calculateDamageWithTypes(movePower, attackerAttack, defenderDefense, attackerPokemon, defenderPokemon) {
    // Extract types
    const defenderTypeElement = defenderPokemon.querySelector(".types");
    let defenderTypes = defenderTypeElement ? defenderTypeElement.textContent.split(", ") : [];

    if (!Array.isArray(defenderTypes)) {
        console.error("Defender types is not an array:", defenderTypes);
        defenderTypes = []; // Prevenir crash con empty array
    }

    let typeEffectiveness = 1;

    // Comprobar efectividad de tipos
    defenderTypes.forEach(defenderType => {
        if (typeAdvantages[attackerPokemon.type] && typeAdvantages[attackerPokemon.type].includes(defenderType)) {
            typeEffectiveness *= 2; // Super effective
        } else if (typeAdvantages[defenderType] && typeAdvantages[defenderType].includes(attackerPokemon.type)) {
            typeEffectiveness *= 0.5; // Not very effective
        }
    });
    let damage = 0;
    if (movePower >= 100) {
        if (Math.floor(Math.random() * 20) <= 3) {
            damage = Math.max(Math.floor((movePower * ((attackerAttack) / defenderDefense)) + 2), 1);
            console.log("pepe" + damage);
            return damage;
        }
        else {
            damage = Math.max(Math.floor((movePower * 0.25 * ((attackerAttack) / defenderDefense)) + 1), 1);
            console.log("2do" + damage);
            return damage;
        }
    }
    // Calcular el daño
    damage = Math.floor(((movePower * (attackerAttack / defenderDefense)) * typeEffectiveness) / 2);
    return damage > 0 ? damage : 1;
}
let counter = 0;
function battleTurn() {
    console.log("valor es de:", battleMode.value);
    console.log("Valor de conunter en battleTurn", counter);
    if (battleMode.value === "pvp") {
        console.log(counter);
        counter++;
        fightTurn(counter);
    } else if (battleMode.value === "pvm") {
        machineTurn();
        fightTurn(0);
        counter++;
    }
}
function fightTurn(turn) {
    if (turn % 2 == 0) {
        let attacker = team2;
        let defender = team1;
        if (defender.classList.contains('blurred')) {
            defender.classList.remove("blurred");
        }
        attacker.classList.add("blurred");
    }
    else if (turn % 2 == 1) {
        let attacker = team1;
        let defender = team2;
        if (defender.classList.contains('blurred')) {
            defender.classList.remove("blurred");
        }
        attacker.classList.add("blurred");
    }
}

battleMode.addEventListener("change", () => {
    infoText.innerHTML += `Battle mode set to: ${battleMode.value === "pvp" ? "Player vs Player" : "Player vs Machine"}.<br>`;
});
// function takeoutBlurr() {
//     team1.classList.remove("blurred");
//     team2.classList.remove("blurred");
// }


// Genera un daño basado en el ataque, defensa y daño del movimiento
function calculateDamage(movePower, attackerAttack, defenderDefense, moveType, defenderTypes) {
    let damage = 0;
    if (movePower >= 100) {
        if (Math.floor(Math.random() * 20) <= 3) {
            damage = Math.max(Math.floor((movePower * ((attackerAttack) / defenderDefense)) + 2), 1);
            console.log("pepe" + damage);
            return damage;
        }
        else {
            damage = Math.max(Math.floor((movePower * 0.25 * ((attackerAttack) / defenderDefense)) + 1), 1);
            console.log("2do" + damage);
            return damage;
        }
    }
    // Calculo Base damage
    damage = Math.max(Math.floor((movePower * 0.5 * (attackerAttack / defenderDefense)) + 2), 1);

    // Calcular efectividad de tipo
    let effectiveness = 1; // Default neutral
    defenderTypes.forEach(defenderType => {
        effectiveness *= typeChart[moveType]?.[defenderType] || 1; // Vuelve a neutral si no hay efectividad
    });

    // Ajustar daño según la efectividad
    damage = Math.floor(damage * effectiveness);
    console.log("El efecto es:", effectiveness);
    // Poner información en pantalla
    if (effectiveness > 1) {
        infoText.innerHTML += "It's super effective!<br>";
    } else if (effectiveness < 1 && effectiveness > 0) {
        infoText.innerHTML += "It's not very effective...<br>";
    } else if (effectiveness === 0) {
        infoText.innerHTML += "It had no effect.<br>";
    }

    return damage;
}

// Aplica daño al objetivo y verifica si es derrotado
function applyDamage(targetCard, damage) {
    const hpElement = targetCard.querySelector(".hp");
    let currentHP = parseInt(hpElement.textContent.split(": ")[1]); // Extraer solo el número
    currentHP -= damage;

    // Asegurarse de no tener valores negativos
    currentHP = Math.max(currentHP, 0);

    hpElement.textContent = `HP: ${currentHP}`;
    // Si el HP llega a 0, el Pokémon queda derrotado
    if (currentHP === 0) {
        updateCardColorForDefeat(targetCard);
        targetCard.querySelector(".moves-container").innerHTML = "Defeated!";
        infoText.innerHTML += `${targetCard.querySelector(".pokeName").textContent} has been defeated.<br>`;
        // Verificar si todos los Pokémon han sido derrotados
        allPokemonDefeated();
    }
}



// function changeTurn() {
//     if (team1.children.length != 0 && team2.children.length != 0) {
//         infoText.innerHTML += `Battle started between ${team1.children.length} and ${team2.children.length} pokemon.<br>`;
//         infoText.innerHTML += 'Es el turno del jugador ' + (counter % 2 + 1) + '<br>';
//     }
// }
function allPokemonDefeated() {
    // Verifica si todos los Pokémon de team1 o team2 tienen la clase "defeated"
    const allTeam1Defeated = Array.from(team1.children).every(child => child.classList.contains("defeated"));
    const allTeam2Defeated = Array.from(team2.children).every(child => child.classList.contains("defeated"));

    if (allTeam1Defeated || allTeam2Defeated) {
        infoText.innerHTML += "All Pokémon have been defeated.<br>";

        if (allTeam1Defeated) {
            if (battleMode.value === "pvm") {
                infoText.innerHTML += 'El ganador es la máquina!<br>';
            } else {
                infoText.innerHTML += 'El ganador es el jugador 2!<br>';
            }
            team1.classList.add("blurred");
            team2.classList.remove("blurred");
        }

        if (allTeam2Defeated) {
            if (battleMode.value === "pvm") {
                infoText.innerHTML += 'El ganador es el jugador!<br>';
            } else {
                infoText.innerHTML += 'El ganador es el jugador 1!<br>';
            }
            team2.classList.add("blurred");
            team1.classList.remove("blurred");
        }

        defeated = true; // Marca la batalla como finalizada
    }
}

// Añade los movimientos como botones a la tarjeta del Pokémon
async function addMovesToCard(card, data_moves, attackerAttack, defenderCard) {
    const movesContainer = card.querySelector(".moves-container");
    for (let i = 0; i < Math.min(4, data_moves.length); i++) {
        const move = data_moves[i];
        const moveData = await fetchDataMovements(move.move.url);
        // Crear el botón del movimiento
        const moveButton = document.createElement("button");
        moveButton.textContent = `${moveData.name} (${moveData.power || "N/A"})`;
        moveButton.classList.add("move-button");
        // Asigna un evento al botón para seleccionar objetivo y aplicar el movimiento
        moveButton.addEventListener("click", () => {
            if (!moveData.power) {
                alert("This move has no power defined!");
                return;
            }

            // Mostrar opciones de selección de objetivo
            const defenderOptions = Array.from(defenderCard.children);
            if (defenderOptions.length === 0) {
                alert("No Pokémon available in the opposing team!");
                return;
            }
            // Crear un mensaje para seleccionar objetivo
            console.log("Counter de turno3", counter);
            battleTurn();
            const targetSelector = document.createElement("div");
            targetSelector.classList.add("target-selector");
            targetSelector.innerHTML = `<p>Select a target Pokémon:</p>`;
            defenderOptions.forEach(defender => {
                const targetButton = document.createElement("button");
                targetButton.textContent = defender.querySelector(".pokeName").textContent;
                targetButton.classList.add("target-button");

                // Al seleccionar un objetivo, aplicar daño

                targetButton.addEventListener("click", () => {
                    const moveType = moveData.type.name;
                    const defenderTypes = Array.from(defender.querySelector(".type").textContent.replace("Type: ", "").split(", "));
                    const defenderDefense = parseInt(defender.querySelector(".defense").textContent.split(": ")[1]);
                    const damage = calculateDamage(moveData.power, attackerAttack, defenderDefense, moveType, defenderTypes);
                    applyDamage(defender, damage);
                    if (!defeated)
                        console.log(defender.querySelector(".pokeName").textContent);
                    infoText.innerHTML += `Damage dealt to ${defender.querySelector(".pokeName").textContent}: ${damage}<br>`;
                    // Remover selector de objetivo después de usar
                    if (!defeated) {
                        console.log("Counter de turno2", counter);
                        infoText.innerHTML += 'Es el turno del jugador ' + (counter % 2 + 1) + '<br>';
                    }
                    document.body.removeChild(targetSelector);
                    // takeoutBlurr();
                });

                targetSelector.appendChild(targetButton);
            });
            allPokemonDefeated();
            // Agregar selector al DOM
            document.body.appendChild(targetSelector);
        });
        movesContainer.appendChild(moveButton);

    }
    if (team1.children.length == pokemonLimit) {
        firsttext.innerHTML += `Batalla empezada! <br>`;
        console.log("Counter de turno", counter);
        firsttext.innerHTML += 'Es el turno del jugador ' + (counter % 2 + 1) + '<br>';
    }
}


