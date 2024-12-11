
let team1 = document.getElementById("team1pokemon");
let team2 = document.getElementById("team2pokemon");
const addNewPokemon = document.getElementById("getPokemon");
let numberOfPokemon = document.getElementById("pokemonNumber");
let addNewPokemonforTeam2 = document.getElementById("getPokemon2");
const begin_battle = document.getElementById("battle");
let infoText = document.getElementById("infoText");
let selectedTeam1Pokemon = null;
let selectedTeam2Pokemon = null;
setInterval(() => {
    let pokemonLimit = numberOfPokemon.value;
    if (team2.children.length >= pokemonLimit) {
        addNewPokemonforTeam2.disabled = true;
    }
    if (team1.children.length >= pokemonLimit) {
        addNewPokemon.disabled = true;
    }
    if ((team1.children.length != 0) && (team2.children.length != 0)) {
        begin_battle.disabled = false;
    }
}, 1)
function applyTypeClass(card, types) {
    const primaryType = types[0]?.type.name || "default";
    card.classList.add(`type-${primaryType}`);
}

function updateCardColorForDefeat(card) {
    card.classList.remove(...Array.from(card.classList).filter(cls => cls.startsWith('type-')));
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
    infoText.innerHTML += `The Pokémon ${data.name} has been added to the team!<br>`;
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

});

function showAbilities(numberRandom) {
    const team = numberRandom === 1 ? team1 : team2;
    if (!team.children.length) return;
    const randomIndex = Math.floor(Math.random() * team.children.length);
    const selectedPokemon = team.children[randomIndex];
    const abilities = selectedPokemon.querySelector(".abilities").textContent;
    infoText.innerHTML += `Random Pokémon abilities: ${abilities}<br>`;
}

document.getElementById("selectTeam1Pokemon").addEventListener("click", () => {
    if (team1.children.length === 0) {
        infoText.innerHTML += "No Pokémon available to select in Team 1!<br>";
        return;
    }
    const randomIndex = Math.floor(Math.random() * team1.children.length);
    selectedTeam1Pokemon = team1.children[randomIndex];
    infoText.innerHTML += `Selected Pokémon from Team 1: ${selectedTeam1Pokemon.querySelector(".pokeName").textContent}<br>`;
});

document.getElementById("selectTeam2Pokemon").addEventListener("click", () => {
    if (team2.children.length === 0) {
        infoText.innerHTML += "No Pokémon available to select in Team 2!<br>";
        return;
    }
    const randomIndex = Math.floor(Math.random() * team2.children.length);
    selectedTeam2Pokemon = team2.children[randomIndex];
    infoText.innerHTML += `Selected Pokémon from Team 2: ${selectedTeam2Pokemon.querySelector(".pokeName").textContent}<br>`;
});

function assignInitialHP(card) {
    const hp = 100;
    card.setAttribute("data-hp", hp);
    const hpElement = document.createElement("p");
    hpElement.classList.add("hp");
    hpElement.textContent = `HP: ${hp}`;
    card.appendChild(hpElement);
}



function fightTurn() {
    if (!selectedTeam1Pokemon || !selectedTeam2Pokemon) {
        infoText.innerHTML += "Both teams need to select a Pokémon before the battle!<br>";
        return;
    }

    // Seleccionar movimientos aleatorios para ambos Pokémon
    const team1Moves = Array.from(selectedTeam1Pokemon.querySelector(".moves-container").children);
    const team2Moves = Array.from(selectedTeam2Pokemon.querySelector(".moves-container").children);

    if (team1Moves.length === 0 || team2Moves.length === 0) {
        infoText.innerHTML += "Both Pokémon must have moves to fight!<br>";
        return;
    }

    const team1MoveButton = team1Moves[Math.floor(Math.random() * team1Moves.length)];
    const team2MoveButton = team2Moves[Math.floor(Math.random() * team2Moves.length)];

    // Obtener información de los movimientos
    const team1MoveName = team1MoveButton.textContent.split(" (")[0];
    const team1MovePower = parseInt(team1MoveButton.textContent.split("(")[1].split(")")[0]) || 0;

    const team2MoveName = team2MoveButton.textContent.split(" (")[0];
    const team2MovePower = parseInt(team2MoveButton.textContent.split("(")[1].split(")")[0]) || 0;

    // Obtener estadísticas de ataque y defensa
    const team1Attack = parseInt(selectedTeam1Pokemon.querySelector(".atacks").textContent.split(": ")[1]);
    const team2Attack = parseInt(selectedTeam2Pokemon.querySelector(".atacks").textContent.split(": ")[1]);
    const team1Defense = parseInt(selectedTeam1Pokemon.querySelector(".defense").textContent.split(": ")[1]);
    const team2Defense = parseInt(selectedTeam2Pokemon.querySelector(".defense").textContent.split(": ")[1]);

    // Calcular daño
    const damageToTeam1 = calculateDamage(team2MovePower, team2Attack, team1Defense);
    const damageToTeam2 = calculateDamage(team1MovePower, team1Attack, team2Defense);

    // Aplicar daño
    applyDamage(selectedTeam1Pokemon, damageToTeam1);
    applyDamage(selectedTeam2Pokemon, damageToTeam2);

    // Actualizar el registro de combate
    infoText.innerHTML += `
        Team 1's ${selectedTeam1Pokemon.querySelector(".pokeName").textContent} used ${team1MoveName}, dealing ${damageToTeam2} damage!<br>
        Team 2's ${selectedTeam2Pokemon.querySelector(".pokeName").textContent} used ${team2MoveName}, dealing ${damageToTeam1} damage!<br>
    `;

    // Comprobar derrotas
    const team1HP = parseInt(selectedTeam1Pokemon.querySelector(".hp").textContent.split(": ")[1]);
    const team2HP = parseInt(selectedTeam2Pokemon.querySelector(".hp").textContent.split(": ")[1]);

    if (team1HP <= 0) {
        infoText.innerHTML += `Team 1's ${selectedTeam1Pokemon.querySelector(".pokeName").textContent} is defeated!<br>`;
    }

    if (team2HP <= 0) {
        infoText.innerHTML += `Team 2's ${selectedTeam2Pokemon.querySelector(".pokeName").textContent} is defeated!<br>`;
    }

    // Reiniciar selección para el próximo turno
    selectedTeam1Pokemon = null;
    selectedTeam2Pokemon = null;
}


begin_battle.addEventListener("click", () => {
    fightTurn();
});

// Genera un daño basado en el ataque, defensa y daño del movimiento
function calculateDamage(movePower, attackerAttack, defenderDefense) {
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
    damage = Math.max(Math.floor((movePower * 0.5 * ((attackerAttack) / defenderDefense)) + 2), 1);
    console.log("ultimo" + damage);
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
            const targetSelector = document.createElement("div");
            targetSelector.classList.add("target-selector");
            targetSelector.innerHTML = `<p>Select a target Pokémon:</p>`;
            defenderOptions.forEach(defender => {
                const targetButton = document.createElement("button");
                targetButton.textContent = defender.querySelector(".pokeName").textContent;
                targetButton.classList.add("target-button");

                // Al seleccionar un objetivo, aplicar daño
                targetButton.addEventListener("click", () => {
                    const defenderDefense = parseInt(defender.querySelector(".defense").textContent.split(": ")[1]);
                    const damage = calculateDamage(moveData.power, attackerAttack, defenderDefense);
                    applyDamage(defender, damage);

                    // Remover selector de objetivo después de usar
                    document.body.removeChild(targetSelector);
                });

                targetSelector.appendChild(targetButton);
            });

            // Agregar selector al DOM
            document.body.appendChild(targetSelector);
        });

        movesContainer.appendChild(moveButton);
    }
}


