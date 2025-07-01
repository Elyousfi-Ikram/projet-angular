export interface User {
  _id: string;
  username: string; // ou peut-être `name` selon votre backend
  prenom?: string; // champ ajouté
  name?: string; // champ ajouté
  email: string;
  phone?: string; // champ ajouté
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}