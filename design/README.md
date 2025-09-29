# BitDogLab Design System

## Introdução

Este documento detalha o Design System do projeto BitDogLab, abrangendo a paleta de cores, tipografia, gradientes e animações, conforme configurado no `tailwind.config.ts`. O objetivo é garantir consistência visual e facilitar a colaboração entre design e desenvolvimento.

## 1. Cores

As cores são o pilar do Design System, organizadas em paletas tonais e tokens de uso específico para o Light Mode. Isso garante flexibilidade e consistência em toda a interface.

### 1.1. Paleta Tonal

A paleta tonal define as cores base do projeto, com variações de tonalidade para cada cor principal (Primary, Secondary, Neutral). Essas variações são usadas para construir os tokens de design.

| Paleta   | 10        | 20        | 30        | 40        | 50        |
| :------- | :-------- | :-------- | :-------- | :-------- | :-------- |
| Primary  | `#162F3E` | `#244B64` | `#3F84AF` | `#5D9DC4` | `#A8CADF` |
| Secondary| `#720D46` | `#A01262` | `#E31A8B` | `#ED54AA` | `#F7BADD` |
| Neutral  | `#000000` | `#4D4D4D` | `#8A8A8A` | `#E6E6E6` | `#FFFFFF` |

### 1.2. Tokens do Light Mode

Os tokens de design são estilos nomeados que mapeiam as cores da paleta tonal para usos específicos na interface, garantindo consistência e facilitando a manutenção. Cada token deve ser criado no Figma e utilizado no código.

| Token Name            | Valor (Hex) | Origem        | Uso Recomendado                                  |
| :-------------------- | :---------- | :------------ | :----------------------------------------------- |
| `theme/light/primary` | `#3F84AF`   | Primary 30    | Cor principal, botões, links, destaques          |
| `theme/light/on-primary` | `#FFFFFF`   | Neutral 50    | Texto/ícone sobre fundo primary                  |
| `theme/light/primary-container` | `#A8CADF`   | Primary 50    | Fundo de elementos destacados, cards, chips      |
| `theme/light/on-primary-container` | `#244B64`   | Primary 20    | Texto/ícone sobre primary-container              |
| `theme/light/secondary` | `#E31A8B`   | Secondary 30  | Botões secundários, elementos de apoio           |
| `theme/light/on-secondary` | `#FFFFFF`   | Neutral 50    | Texto/ícone sobre fundo secondary                |
| `theme/light/secondary-container` | `#F7BADD`   | Secondary 50  | Fundo de alertas, cartões secundários            |
| `theme/light/on-secondary-container` | `#A01262`   | Secondary 20  | Texto sobre secondary-container                  |
| `theme/light/background` | `#FFFFFF`   | Neutral 50    | Fundo geral da interface                         |
| `theme/light/surface` | `#E6E6E6`   | Neutral 40    | Fundo de cards, modais, menus                    |
| `theme/light/on-surface` | `#4D4D4D`   | Neutral 20    | Texto sobre surface                              |
| `theme/light/error`   | `#ED54AA`   | Secondary 40  | Mensagens de erro, avisos                        |
| `theme/light/on-error` | `#FFFFFF`   | Neutral 50    | Texto sobre erro                                 |
| `theme/light/border`  | `#000000`   | Neutral 10    | Bordas e divisores                               |
| `theme/light/heading` | `#000000`   | Neutral 10    | Títulos principais                               |
| `theme/light/text`    | `#000000`   | Neutral 10    | Texto comum, legendas, parágrafos                |
| `theme/light/hover`   | `#244B64`   | Primary 20    | Hover em botões primários                        |
| `theme/light/hover-secondary` | `#A01262`   | Secondary 20  | Hover em botões secundários                      |

### 1.3. Cores RGB Adicionais

Além dos tokens de design, o projeto utiliza cores RGB específicas para propósitos variados, como gradientes ou elementos visuais diretos.

| Nome      | Valor (RGB)       |
| :-------- | :---------------- |
| `rgb-red` | `rgb(255, 0, 0)`  |
| `rgb-green` | `rgb(0, 255, 0)`  |
| `rgb-blue` | `rgb(0, 0, 255)`  |

## 2. Tipografia

A tipografia é um elemento crucial para a legibilidade e a identidade visual do projeto. O BitDogLab utiliza a fonte 'Ubuntu' com pesos específicos para diferentes hierarquias de texto.

### 2.1. Família de Fonte

O projeto utiliza a fonte `Ubuntu` como sua principal família de fonte.

```typescript
fontFamily: {
    ubuntu: [\'Ubuntu\', \'sans-serif\'],
},
```

### 2.2. Pesos de Fonte

Os seguintes pesos de fonte estão configurados para uso com a fonte Ubuntu:

| Peso      | Valor Numérico |
| :-------- | :------------- |
| `regular` | `400`          |
| `medium`  | `500`          |
| `bold`    | `700`          |

### 2.3. Tamanhos de Fonte

O Design System define uma escala de tamanhos de fonte para garantir consistência e hierarquia visual.

| Tamanho | Valor (rem) | Valor (px) |
| :------ | :---------- | :--------- |
| `xs`    | `0.75rem`   | `12px`     |
| `sm`    | `0.875rem`  | `14px`     |
| `md`    | `1rem`      | `16px`     |
| `lg`    | `1.25rem`   | `20px`     |
| `xl`    | `1.5rem`    | `24px`     |

## 3. Gradientes

Os gradientes são utilizados para adicionar profundidade e dinamismo à interface, com combinações de cores predefinidas.

| Nome                 | Definição                                       |
| :------------------- | :---------------------------------------------- |
| `gradient-blue`      | `linear-gradient(to right, #000000, rgb(0, 0, 255))` |
| `gradient-green`     | `linear-gradient(to right, #000000, rgb(0, 255, 0))` |
| `gradient-red`       | `linear-gradient(to right, #000000, rgb(255, 0, 0))` |
| `gradient-pink-blue` | `linear-gradient(to bottom left, #e31a8b, #3f84af)` |

## 4. Animações

O projeto inclui animações para melhorar a experiência do usuário, com keyframes e durações predefinidas.

### 4.1. Keyframes

| Nome             | Descrição                                                                 |
| :--------------- | :------------------------------------------------------------------------ |
| `accordion-down` | Animação para expandir um elemento (altura de 0 para `var(--radix-accordion-content-height)`) |
| `accordion-up`   | Animação para recolher um elemento (altura de `var(--radix-accordion-content-height)` para 0) |

### 4.2. Duração das Animações

| Nome             | Duração e Curva de Animação |
| :--------------- | :-------------------------- |
| `accordion-down` | `accordion-down 0.2s ease-out` |
| `accordion-up`   | `accordion-up 0.2s ease-out` |

## 5. Configuração do Container

A configuração do container define o comportamento de layout padrão para elementos de conteúdo.

- **Centralizado**: `center: true`
- **Padding Padrão**: `2rem`
- **Largura Máxima para Telas 2XL**: `1400px`

## 6. Plugins

O projeto utiliza o plugin `tailwindcss-animate` para estender as funcionalidades de animação do Tailwind CSS.

```typescript
plugins: [require(\'tailwindcss-animate\')],
```

## Conclusão

Este documento serve como um guia abrangente para o Design System do BitDogLab, fornecendo as diretrizes e especificações para cores, tipografia, gradientes, animações e layout. A adesão a estas diretrizes garantirá uma experiência de usuário consistente e coesa em todo o projeto.



### 1.1.1. Paleta Primary

![Primary 10](design/primary_palette_10.png)
![Primary 20](design/primary_palette_20.png)
![Primary 30](design/primary_palette_30.png)
![Primary 40](design/primary_palette_40.png)
![Primary 50](design/primary_palette_50.png)

### 1.1.2. Paleta Secondary

![Secondary 10](design/secondary_palette_10.png)
![Secondary 20](design/secondary_palette_20.png)
![Secondary 30](design/secondary_palette_30.png)
![Secondary 40](design/secondary_palette_40.png)
![Secondary 50](design/secondary_palette_50.png)

### 1.1.3. Paleta Neutral

![Neutral 10](design/neutral_palette_10.png)
![Neutral 20](design/neutral_palette_20.png)
![Neutral 30](design/neutral_palette_30.png)
![Neutral 40](design/neutral_palette_40.png)
![Neutral 50](design/neutral_palette_50.png)

### 3.1. Exemplos Visuais de Gradientes

![Gradient Blue](design/gradient_blue.png)
![Gradient Green](design/gradient_green.png)
![Gradient Red](design/gradient_red.png)
![Gradient Pink Blue](design/gradient_pink_blue.png)